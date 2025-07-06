import { NextResponse } from 'next/server'
import { PromptEngineer } from '@/lib/promptEngineering'
import { LLM_MODELS, callLLM } from '@/lib/llmProviders'

export async function POST(request: Request) {
  try {
    const { 
      image, 
      context, 
      userProfile
    } = await request.json()
    
    // Extrahiere promptVariant aus context, falls vorhanden
    const promptVariant = context?.promptVariant || 'extended'
    
    console.log('🔍 Debug - Received context:', context)
    console.log('🔍 Debug - Extracted promptVariant:', promptVariant)
    
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

    // LLM-Konfiguration
    const modelConfig = LLM_MODELS[userProfile.selectedModel]
    if (!modelConfig) {
      return NextResponse.json(
        { error: `Unbekanntes LLM-Modell: ${userProfile.selectedModel}` },
        { status: 400 }
      )
    }

    // API-Key-Validierung (außer für lokale LLMs)
    if (modelConfig.requiresApiKey && !userProfile.apiKey) {
      return NextResponse.json(
        { error: `API-Key für ${modelConfig.name} nicht konfiguriert` },
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
      viewName: context?.viewName || 'Hauptansicht'
    }

    // Prompt generieren mit der korrekten Variante
    const prompt = PromptEngineer.createUsabilityPrompt(
      appContext, 
      true, 
      context?.customPrompt, 
      promptVariant
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
    
    const processingTime = Date.now() - startTime
    console.log(`✅ Analyse abgeschlossen mit ${modelConfig.name} in ${processingTime}ms`)
    
    // Strukturierte Antwort für wissenschaftliche Auswertung
    const scientificResponse = {
      analysis,
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
    }
    
    return NextResponse.json(scientificResponse)
    
  } catch (error) {
    console.error('❌ Analyse-Fehler:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    return NextResponse.json(
      { error: `Analyse fehlgeschlagen: ${errorMessage}` },
      { status: 500 }
    )
  }
}
