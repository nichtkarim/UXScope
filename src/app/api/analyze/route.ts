import { NextResponse } from 'next/server'
import { PromptEngineer } from '@/lib/promptEngineering'

/**
 * Standardisiert die Formatierung der Kategorie-Tags in LLM-Outputs
 * Sorgt dafür, dass sowohl deutsche als auch englische Outputs konsistent formatiert sind
 */
function standardizeFormatting(text: string): string {
  if (!text) return text;
  
  // Standardisiere verschiedene Formatierungsvarianten zu **[CATEGORY]**
  const categories = [
    'CATASTROPHIC', 'KATASTROPHAL',
    'CRITICAL', 'KRITISCH', 
    'SERIOUS', 'ERNST',
    'MINOR', 'GERING',
    'POSITIVE', 'POSITIV'
  ];
  
  let standardizedText = text;
  
  for (const category of categories) {
    // Einfacher Ansatz ohne lookbehind/lookahead für bessere Kompatibilität
    
    // 1. *[CATEGORY]** -> **[CATEGORY]**
    standardizedText = standardizedText.replace(
      new RegExp(`\\*\\[${category}\\]\\*\\*`, 'gi'), 
      `**[${category}]**`
    );
    
    // 2. [CATEGORY]** -> **[CATEGORY]** (am Zeilenanfang oder nach Leerzeichen)
    standardizedText = standardizedText.replace(
      new RegExp(`(^|\\s)\\[${category}\\]\\*\\*`, 'gim'), 
      `$1**[${category}]**`
    );
    
    // 3. *[CATEGORY]* -> **[CATEGORY]** (aber nicht wenn bereits ** davor/danach)
    standardizedText = standardizedText.replace(
      new RegExp(`([^*])\\*\\[${category}\\]\\*([^*])`, 'gi'), 
      `$1**[${category}]**$2`
    );
  }
  
  return standardizedText;
}

/**
 * Extrahiert Kategorisierungsinformationen und erstellt eine saubere, nutzerfreundliche Ausgabe
 * Entfernt die störenden [KATEGORIE] Tags für bessere Lesbarkeit
 */
function extractCategoriesAndCleanText(text: string): {
  cleanText: string;
  findings: Array<{
    category: string;
    text: string;
  }>;
} {
  if (!text) return { cleanText: '', findings: [] };
  
  const categories = [
    'CATASTROPHIC', 'KATASTROPHAL',
    'CRITICAL', 'KRITISCH', 
    'SERIOUS', 'ERNST',
    'MINOR', 'GERING',
    'POSITIVE', 'POSITIV'
  ];
  
  const findings: Array<{ category: string; text: string }> = [];
  
  // Standardisiere zuerst die Formatierung
  let processedText = standardizeFormatting(text);
  
  // Teile den Text in Absätze auf und verarbeite jeden einzeln
  const paragraphs = processedText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const cleanFindings: string[] = [];
  
  for (const paragraph of paragraphs) {
    let foundCategory = false;
    let categoryMatch = null;
    
    // Suche nach Kategorie-Tags am Anfang des Absatzes
    for (const category of categories) {
      const categoryRegex = new RegExp(`\\*\\*\\[${category}\\]\\*\\*\\s*(.*)`, 'is');
      const match = paragraph.match(categoryRegex);
      
      if (match) {
        categoryMatch = match;
        foundCategory = true;
        const findingText = match[1].trim();
        
        findings.push({
          category: category,
          text: findingText
        });
        
        // Sammle saubere Befunde ohne Kategorie-Tags
        cleanFindings.push(findingText);
        break;
      }
    }
    
    // Wenn kein Kategorie-Tag gefunden wurde, behandle als normalen Text
    if (!foundCategory) {
      const cleanParagraph = paragraph.trim();
      if (cleanParagraph.length > 0) {
        // Entferne eventuelle verbleibende Tags
        const withoutTags = cleanParagraph.replace(/\*\*\[[^\]]+\]\*\*/g, '').trim();
        if (withoutTags.length > 0) {
          cleanFindings.push(withoutTags);
          
          // Füge als unbekannte Kategorie hinzu
          findings.push({
            category: 'UNCATEGORIZED',
            text: withoutTags
          });
        }
      }
    }
  }
  
  // Erstelle sauberen Text mit Absätzen zwischen den Befunden (deutscher Stil)
  const cleanText = cleanFindings
    .map(finding => finding.trim())
    .filter(finding => finding.length > 0)
    .join('\n\n');
  
  return { cleanText, findings };
}

export async function POST(request: Request) {
  console.log('🔍 API Route called - /api/analyze')
  try {
    // Dynamically import LLM providers to catch any import errors
    let LLM_MODELS, callLLM;
    try {
      console.log('🔍 Starting dynamic import...');
      const llmModule = await import('@/lib/llmProviders');
      console.log('🔍 LLM Module imported:', Object.keys(llmModule));
      LLM_MODELS = llmModule.LLM_MODELS;
      callLLM = llmModule.callLLM;
      console.log('🔍 Dynamic import successful - LLM_MODELS:', !!LLM_MODELS, 'callLLM:', !!callLLM);
      if (LLM_MODELS) {
        console.log('🔍 Available models:', Object.keys(LLM_MODELS));
      }
    } catch (importError) {
      console.error('❌ Failed to import LLM providers:', importError);
      const errorMessage = importError instanceof Error ? importError.message : String(importError);
      return NextResponse.json(
        { error: `LLM Provider import failed: ${errorMessage}` },
        { status: 500 }
      )
    }

    if (!LLM_MODELS || !callLLM) {
      console.error('❌ LLM-Services nicht verfügbar nach Import')
      return NextResponse.json(
        { error: 'LLM-Services nicht verfügbar nach Import' },
        { status: 500 }
      )
    }

    console.log('🔍 Parsing request body...')
    const requestBody = await request.json()
    console.log('🔍 Request body keys:', Object.keys(requestBody))
    
    const { 
      image, 
      context, 
      userProfile
    } = requestBody
    
    console.log('🔍 Extracted data:', {
      hasImage: !!image,
      hasContext: !!context,
      hasUserProfile: !!userProfile,
      userProfileKeys: userProfile ? Object.keys(userProfile) : 'none'
    })
    
    // Extrahiere promptVariant, promptLanguage und uiMode aus context, falls vorhanden
    const promptVariant = context?.promptVariant || 'advanced'
    const promptLanguage = context?.language || 'de'
    const uiMode = context?.uiMode || 'generalized'
    
    console.log('🔍 Debug - Received context:', context)
    console.log('🔍 Debug - Extracted promptVariant:', promptVariant)
    console.log('🔍 Debug - Extracted promptLanguage:', promptLanguage)
    console.log('🔍 Debug - Extracted uiMode:', uiMode)
    
    // Validierung
    if (!image && !context) {
      return NextResponse.json(
        { error: 'Bild oder Kontext erforderlich' },
        { status: 400 }
      )
    }

    if (!userProfile || !userProfile.selectedModel) {
      return NextResponse.json(
        { error: 'Benutzerprofil mit LLM-Modell erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob selectedModel ein String ist
    if (typeof userProfile.selectedModel !== 'string') {
      return NextResponse.json(
        { error: 'Ungültiges LLM-Modell Format' },
        { status: 400 }
      )
    }

    // LLM-Konfiguration mit sicherer Zugriffsprüfung
    if (!LLM_MODELS || typeof LLM_MODELS !== 'object') {
      return NextResponse.json(
        { error: 'LLM-Modelle nicht verfügbar' },
        { status: 500 }
      )
    }

    const modelConfig = LLM_MODELS[userProfile.selectedModel]
    if (!modelConfig) {
      return NextResponse.json(
        { error: `Unbekanntes LLM-Modell: ${userProfile.selectedModel}` },
        { status: 400 }
      )
    }

    // API-Key-Validierung (außer für lokale LLMs)
    if (modelConfig.requiresApiKey && !userProfile.apiKey) {
      // Generate prompt for testing even if API key is missing
      const appContext = {
        appDescription: context?.description || 'Unbekannte Anwendung',
        userTask: context?.userTask || 'Allgemeine Usability-Evaluation',
        screenshot: image || '',
        viewName: context?.viewName || 'Hauptansicht',
        sourceCode: context?.uiCode || ''
      }
      
      const prompt = PromptEngineer.createUsabilityPrompt(
        appContext, 
        true, 
        context?.customPrompt, 
        promptVariant,
        promptLanguage,
        uiMode
      )
      
      return NextResponse.json(
        { 
          error: `API-Key für ${modelConfig.name} nicht konfiguriert`,
          prompt: prompt // Include prompt for testing
        },
        { status: 400 }
      )
    }

    console.log(`🤖 Starte Analyse mit ${modelConfig.name}...`)
    
    // Warnung für Vision-Fähigkeiten
    if (image && !modelConfig.supportsVision) {
      console.warn(`⚠️ ${modelConfig.name} unterstützt keine Bild-Analyse. Nur Text wird analysiert.`)
    }

    const startTime = Date.now()

    // App-Kontext erstellen
    const appContext = {
      appDescription: context?.description || 'Unbekannte Anwendung',
      userTask: context?.userTask || 'Allgemeine Usability-Evaluation',
      screenshot: image || '',
      viewName: context?.viewName || 'Hauptansicht',
      sourceCode: context?.uiCode || ''
    }

    // Prompt generieren mit der korrekten Variante, Sprache und UI-Modus
    const prompt = PromptEngineer.createUsabilityPrompt(
      appContext, 
      true, 
      context?.customPrompt, 
      promptVariant,
      promptLanguage,
      uiMode
    )
    
    console.log('🔍 API Debug - Generated prompt length:', prompt.length)
    console.log('🔍 API Debug - Prompt preview (first 300 chars):')
    console.log(prompt.substring(0, 300) + '...')

    // LLM aufrufen
    const messages: any[] = [
      { role: 'user', content: prompt }
    ]
    
    if (image && modelConfig.supportsVision) {
      messages[0].content = [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: image } }
      ]
    }
    
    const analysis = await callLLM(
      userProfile.selectedModel,
      userProfile.apiKey,
      messages
    )
    
    console.log('🔍 RAW LLM OUTPUT (first 500 chars):')
    console.log(analysis.substring(0, 500) + '...')
    console.log('🔍 RAW LLM OUTPUT contains [KATEGORIE] tags:', /\*\*\[[A-Z]+\]\*\*/.test(analysis))
    
    // Extrahiere Kategorien und bereite saubere Nutzer-Ausgabe vor
    const { cleanText, findings } = extractCategoriesAndCleanText(analysis);
    
    console.log('🔍 EXTRACTED FINDINGS:')
    findings.forEach((finding, index) => {
      console.log(`${index + 1}. [${finding.category}]: ${finding.text.substring(0, 50)}...`)
    })
    
    const processingTime = Date.now() - startTime
    console.log(`✅ Analyse abgeschlossen mit ${modelConfig.name} in ${processingTime}ms`)
    console.log(`📊 Gefundene Befunde: ${findings.length}`)
    
    // Konvertiere deutsche Kategorien zu Frontend-Severities
    const mapSeverity = (category: string): 'low' | 'medium' | 'high' | 'critical' => {
      const categoryUpper = category.toUpperCase();
      console.log(`🔍 MAPPING: "${category}" -> "${categoryUpper}" -> severity`)
      if (categoryUpper === 'KATASTROPHAL' || categoryUpper === 'CATASTROPHIC') return 'critical';
      if (categoryUpper === 'KRITISCH' || categoryUpper === 'CRITICAL') return 'high';
      if (categoryUpper === 'ERNST' || categoryUpper === 'SERIOUS') return 'medium';
      if (categoryUpper === 'GERING' || categoryUpper === 'MINOR') return 'low';
      if (categoryUpper === 'POSITIV' || categoryUpper === 'POSITIVE') return 'low'; // Positive als low behandeln
      console.log(`⚠️ UNKNOWN CATEGORY: "${category}" -> defaulting to low`)
      return 'low'; // Default
    };
    
    // Strukturierte Probleme für das Frontend erstellen
    const problems = findings.map((finding, index) => {
      const severity = mapSeverity(finding.category);
      console.log(`🔍 PROBLEM ${index + 1}: Category="${finding.category}" -> Severity="${severity}"`);
      return {
        id: `problem-${index + 1}`,
        title: `Problem ${index + 1}`,
        description: finding.text,
        severity: severity,
        category: 'other' as const,
        heuristic: undefined,
        detectedBy: [modelConfig.name],
        isGroundTruth: false
      }
    });
    
    // LLMAnalysis Format für das Frontend
    const llmAnalysis = {
      llmId: userProfile.selectedModel,
      llmName: modelConfig.name,
      problems: problems,
      analysisTime: new Date(),
      promptUsed: prompt,
      rawResponse: analysis
    };
    
    // Rückgabe im erwarteten Format für das Frontend
    const response = {
      analysis: cleanText,         // Was das Frontend als "analysis" erwartet
      cleanText: cleanText,        // Für die Nutzer-Anzeige (Backup)
      rawAnalysis: analysis,       // Original für Debugging
      analyses: [llmAnalysis],     // Array von LLM-Analysen für AlternativeEvaluation
      findings: findings,          // Strukturierte Befunde
      metadata: {
        llmModel: userProfile.selectedModel,
        llmName: modelConfig.name,
        promptUsed: prompt,
        analysisTime: new Date().toISOString(),
        processingTimeMs: processingTime,
        supportsVision: modelConfig.supportsVision,
        imageProvided: !!image,
        contextProvided: !!context,
        promptVariant,
        userProfile: {
          name: userProfile.name,
          email: userProfile.email
        }
      }
    };
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Analyse-Fehler (DETAILLIERT):', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack',
      type: typeof error
    })
    let errorMessage = 'Unbekannter Fehler';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as any).message;
    }
    
    // Try to include prompt in error response for debugging
    let prompt = null;
    try {
      // We can't re-read the request body after it's been consumed
      // So we'll skip generating the prompt in the error case
      console.log('Error occurred, skipping prompt generation for error response');
    } catch (promptError) {
      console.log('Could not generate prompt for error response:', promptError);
    }
    
    // Immer ein JSON-Objekt mit error-Feld zurückgeben
    return NextResponse.json(
      { 
        error: `Analyse fehlgeschlagen: ${errorMessage}`,
        prompt: prompt
      },
      { status: 500 }
    )
  }
}
