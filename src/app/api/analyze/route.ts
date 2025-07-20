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
  try {
    let LLM_MODELS, callLLM;
    try {
      const llmModule = await import('@/lib/llmProviders');
      LLM_MODELS = llmModule.LLM_MODELS;
      callLLM = llmModule.callLLM;
    } catch (importError) {
      console.error('Failed to import LLM providers:', importError);
      const errorMessage = importError instanceof Error ? importError.message : String(importError);
      return NextResponse.json(
        { error: `LLM Provider import failed: ${errorMessage}` },
        { status: 500 }
      )
    }

    if (!LLM_MODELS || !callLLM) {
      console.error('LLM-Services nicht verfügbar nach Import')
      return NextResponse.json(
        { error: 'LLM-Services nicht verfügbar nach Import' },
        { status: 500 }
      )
    }

    const requestBody = await request.json()
    
    const { 
      image, 
      context, 
      userProfile
    } = requestBody
    
    const promptVariant = context?.promptVariant || 'advanced'
    const promptLanguage = context?.language || 'de'
    const uiMode = context?.uiMode || 'generalized'
    
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
          prompt: prompt
        },
        { status: 400 }
      )
    }

    console.log(`Starte Analyse mit ${modelConfig.name}...`)
    
    if (image && !modelConfig.supportsVision) {
      console.warn(`${modelConfig.name} unterstützt keine Bild-Analyse. Nur Text wird analysiert.`)
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


    // LLM aufrufen
    const messages: any[] = [
      { role: 'user', content: prompt }
    ]
    
    if (image && modelConfig.supportsVision) {
      if (modelConfig.provider === 'anthropic') {
        messages[0].content = [
          { type: 'text', text: prompt },
          { 
            type: 'image', 
            source: { 
              type: 'base64',
              media_type: image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
              data: image.split(',')[1]
            } 
          }
        ]
      } else {
        messages[0].content = [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: image } }
        ]
      }
    }
    
    const analysis = await callLLM(
      userProfile.selectedModel,
      userProfile.apiKey,
      messages
    )
    
    const { cleanText, findings } = extractCategoriesAndCleanText(analysis);
    
    const processingTime = Date.now() - startTime
    
    const mapSeverity = (category: string): 'low' | 'medium' | 'high' | 'critical' => {
      const categoryUpper = category.toUpperCase();
      if (categoryUpper === 'KATASTROPHAL' || categoryUpper === 'CATASTROPHIC') return 'critical';
      if (categoryUpper === 'KRITISCH' || categoryUpper === 'CRITICAL') return 'high';
      if (categoryUpper === 'ERNST' || categoryUpper === 'SERIOUS') return 'medium';
      if (categoryUpper === 'GERING' || categoryUpper === 'MINOR') return 'low';
      if (categoryUpper === 'POSITIV' || categoryUpper === 'POSITIVE') return 'low';
      return 'low';
    };
    
    const problems = findings.map((finding, index) => {
      const severity = mapSeverity(finding.category);
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
    
    const llmAnalysis = {
      llmId: userProfile.selectedModel,
      llmName: modelConfig.name,
      problems: problems,
      analysisTime: new Date(),
      promptUsed: prompt,
      rawResponse: analysis
    };
    
    const response = {
      analysis: cleanText,
      cleanText: cleanText,
      rawAnalysis: analysis,
      analyses: [llmAnalysis],
      findings: findings,
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
    console.error('Analyse-Fehler:', error)
    
    // Detaillierte Fehleranalyse für besseres Debugging
    let errorMessage = 'Unbekannter Fehler';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || '';
      
      // Spezielle Behandlung für API-Fehler
      if (error.message.includes('API') || error.message.includes('401') || error.message.includes('403')) {
        errorMessage = `API-Fehler: ${error.message}. Bitte überprüfen Sie Ihren API-Key.`;
      } else if (error.message.includes('model') || error.message.includes('Model')) {
        errorMessage = `Modell-Fehler: ${error.message}. Das gewählte Modell ist möglicherweise nicht verfügbar.`;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as any).message;
      errorDetails = JSON.stringify(error, null, 2);
    }
    
    console.error('Detaillierte Fehlerinformationen:', {
      message: errorMessage,
      details: errorDetails,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name
    });
    
    return NextResponse.json(
      { 
        error: `Analyse fehlgeschlagen: ${errorMessage}`,
        details: errorDetails.substring(0, 1000) // Begrenzte Details für Frontend
      },
      { status: 500 }
    )
  }
}
