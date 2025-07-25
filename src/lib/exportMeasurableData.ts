export interface MeasurableAnalysisData {
  // Test-Setup
  meta: {
    timestamp: string
    llm_model: string
    prompt_variant: 'basic' | 'advanced' | 'study-pure'
    prompt_language: 'de' | 'en'
    processing_time_ms: number
    image_filename?: string
  }
  
  // Automatisch messbare Metriken
  measurable_metrics: {
    // Längen-Metriken
    total_words: number
    total_characters: number
    total_paragraphs: number
    average_words_per_paragraph: number
    
    // Problem-Zählungen
    total_problem_mentions: number
    catastrophic_severity_mentions: number
    critical_severity_mentions: number
    serious_severity_mentions: number
    minor_severity_mentions: number
    
    // Struktur-Metriken
    has_headings: boolean
    has_bullet_points: boolean
    has_numbered_lists: boolean
    heading_count: number
    list_item_count: number
    
    // Keyword-Zählungen
    usability_term_count: number
    ui_component_mentions: number
    recommendation_count: number
    positive_mentions: number
    negative_mentions: number
    
    // Heuristik-Abdeckung
    heuristic_terms_found: string[]
    ui_components_mentioned: string[]
  }
  
  // Rohdaten für deine Analyse
  raw_data: {
    full_analysis: string
    prompt_used: string
    context_description: string
    user_task: string
  }
  
  // Platz für deine manuellen Bewertungen (beim Export leer)
  manual_evaluation: {
    quality_score?: number          // 1-10
    specificity_score?: number      // 1-10  
    actionability_score?: number    // 1-10
    completeness_score?: number     // 1-10
    overall_usefulness?: number     // 1-10
    notes?: string
  }
}

export function calculateMeasurableMetrics(analysis: string): MeasurableAnalysisData['measurable_metrics'] {
  // DEPRECATED: Diese Funktion sollte nicht mehr verwendet werden!
  // Der JSON-Export soll die Werte direkt von der Webseite übernehmen.
  console.warn('calculateMeasurableMetrics wird verwendet - das sollte vermieden werden!')
  
  // Minimale Fallback-Implementierung
  const words = analysis.split(/\s+/).filter(word => word.length > 0)
  const paragraphs = analysis.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  
  return {
    // Nur einfachste Metriken
    total_words: words.length,
    total_characters: analysis.length,
    total_paragraphs: paragraphs.length,
    average_words_per_paragraph: paragraphs.length > 0 ? Math.round(words.length / paragraphs.length) : 0,
    
    // Problem-Zählungen - Fallback auf 0 (sollte von Webseite kommen!)
    total_problem_mentions: 0,
    catastrophic_severity_mentions: 0,
    critical_severity_mentions: 0,
    serious_severity_mentions: 0,
    minor_severity_mentions: 0,
    
    // Struktur-Metriken - einfachste Checks
    has_headings: /^#{1,6}\s|\*\*.*\*\*/m.test(analysis),
    has_bullet_points: /^[\s]*[-•*]\s/m.test(analysis),
    has_numbered_lists: /^[\s]*\d+\.\s/m.test(analysis),
    heading_count: (analysis.match(/^#{1,6}\s|\*\*.*\*\*/gm) || []).length,
    list_item_count: (analysis.match(/^[\s]*[-•*]\s|^[\s]*\d+\.\s/gm) || []).length,
    
    // Keyword-Zählungen - einfachste Regex
    usability_term_count: (analysis.match(/usability|ux|ui/gi) || []).length,
    ui_component_mentions: (analysis.match(/button|form/gi) || []).length,
    recommendation_count: (analysis.match(/empfehlung|recommend/gi) || []).length,
    positive_mentions: (analysis.match(/positiv|gut/gi) || []).length,
    negative_mentions: (analysis.match(/schlecht|problematisch/gi) || []).length,
    
    // Arrays - leer
    heuristic_terms_found: [],
    ui_components_mentioned: []
  }
}

export function exportMeasurableData(
  analysis: string,
  metadata: any,
  promptUsed: string,
  contextData: any,
  promptVariant: string,
  promptLanguage: string,
  calculatedSummary?: any // Optional: bereits berechnete Werte von der Webseite
): MeasurableAnalysisData {
  
  console.log('exportMeasurableData called with:')
  console.log('- analysis length:', analysis?.length || 0)
  console.log('- metadata:', metadata)
  console.log('- promptUsed length:', promptUsed?.length || 0)
  console.log('- contextData:', contextData)
  console.log('- promptVariant:', promptVariant)
  console.log('- promptLanguage:', promptLanguage)
  console.log('- calculatedSummary:', calculatedSummary)
  
  try {
    // Verwende IMMER die bereits berechneten Werte von der Webseite
    let metrics
    if (calculatedSummary) {
      // Einfach die bereits berechneten Werte verwenden - KEINE eigene Logik!
      const words = analysis.split(/\s+/).filter(word => word.length > 0)
      const paragraphs = analysis.split(/\n\s*\n/).filter(p => p.trim().length > 0)
      
      metrics = {
        // Längen-Metriken (einfache Berechnungen)
        total_words: words.length,
        total_characters: analysis.length,
        total_paragraphs: paragraphs.length,
        average_words_per_paragraph: paragraphs.length > 0 ? Math.round(words.length / paragraphs.length) : 0,
        
        // Problem-Zählungen (DIREKT von der Webseite - KEINE eigene Analyse!)
        total_problem_mentions: calculatedSummary.totalProblems,
        catastrophic_severity_mentions: calculatedSummary.catastrophicProblems,
        critical_severity_mentions: calculatedSummary.criticalProblems,
        serious_severity_mentions: calculatedSummary.seriousProblems,
        minor_severity_mentions: calculatedSummary.minorProblems,
        
        // Struktur-Metriken (einfache Regex-Checks)
        has_headings: /^#{1,6}\s|\*\*.*\*\*|^[A-Z][^.!?]*:$/m.test(analysis),
        has_bullet_points: /^[\s]*[-•*]\s/m.test(analysis),
        has_numbered_lists: /^[\s]*\d+\.\s/m.test(analysis),
        heading_count: (analysis.match(/^#{1,6}\s|\*\*.*\*\*/gm) || []).length,
        list_item_count: (analysis.match(/^[\s]*[-•*]\s|^[\s]*\d+\.\s/gm) || []).length,
        
        // Keyword-Zählungen (einfache Counts - KEINE komplexe Analyse!)
        usability_term_count: (analysis.match(/usability|benutzerfreundlich|ux|ui/gi) || []).length,
        ui_component_mentions: (analysis.match(/button|navigation|menu|form|link/gi) || []).length,
        recommendation_count: (analysis.match(/empfehlung|sollte|könnte|verbesserung|recommend/gi) || []).length,
        positive_mentions: calculatedSummary.positiveFindings, // Verwende Webseiten-Werte
        negative_mentions: (analysis.match(/schlecht|problematisch|verwirrend|bad|confusing/gi) || []).length,
        
        // Gefundene Begriffe (einfache Arrays - KEINE komplexe Logik!)
        heuristic_terms_found: ['konsistenz', 'feedback', 'error'].filter(term => 
          analysis.toLowerCase().includes(term.toLowerCase())
        ),
        ui_components_mentioned: ['button', 'form', 'navigation'].filter(term => 
          analysis.toLowerCase().includes(term.toLowerCase())
        )
      }
    } else {
      // Fallback: ERROR - calculatedSummary sollte IMMER vorhanden sein!
      console.error('FEHLER: Keine calculatedSummary vorhanden! JSON-Export kann nicht korrekt funktionieren.')
      console.error('Der JSON-Export benötigt die bereits berechneten Werte von der Webseite.')
      
      // Verwende minimale Fallback-Werte
      const words = analysis.split(/\s+/).filter(word => word.length > 0)
      const paragraphs = analysis.split(/\n\s*\n/).filter(p => p.trim().length > 0)
      
      metrics = {
        total_words: words.length,
        total_characters: analysis.length,
        total_paragraphs: paragraphs.length,
        average_words_per_paragraph: paragraphs.length > 0 ? Math.round(words.length / paragraphs.length) : 0,
        
        // ALLE Problem-Zählungen auf 0 - da keine Webseiten-Werte verfügbar!
        total_problem_mentions: 0,
        catastrophic_severity_mentions: 0,
        critical_severity_mentions: 0,
        serious_severity_mentions: 0,
        minor_severity_mentions: 0,
        
        // Minimal-Struktur
        has_headings: false,
        has_bullet_points: false,
        has_numbered_lists: false,
        heading_count: 0,
        list_item_count: 0,
        
        // Minimal-Keywords
        usability_term_count: 0,
        ui_component_mentions: 0,
        recommendation_count: 0,
        positive_mentions: 0,
        negative_mentions: 0,
        
        // Leere Arrays
        heuristic_terms_found: [],
        ui_components_mentioned: []
      }
    }
    
    const result = {
      meta: {
        timestamp: new Date().toISOString(),
        llm_model: metadata?.llmModel || metadata?.model || 'unknown',
        prompt_variant: promptVariant as any,
        prompt_language: promptLanguage as any,
        processing_time_ms: metadata?.processingTimeMs || metadata?.processingTime || 0,
        image_filename: 'screenshot.png' // könnte erweitert werden
      },
      
      measurable_metrics: metrics,
      
      raw_data: {
        full_analysis: analysis,
        prompt_used: promptUsed,
        context_description: contextData?.description || '',
        user_task: contextData?.userTask || ''
      },
      
      manual_evaluation: {
        // Leer - für deine späteren Bewertungen
      }
    }
    
    console.log('exportMeasurableData result:', result)
    return result
  } catch (error) {
    console.error('Error in exportMeasurableData:', error)
    throw error
  }
}

export function downloadJsonFile(data: any, filename: string) {
  console.log('downloadJsonFile called with:')
  console.log('- filename:', filename)
  console.log('- data:', data)
  
  try {
    const jsonString = JSON.stringify(data, null, 2)
    console.log('JSON string length:', jsonString.length)
    
    // Robustere Download-Funktion für verschiedene Browser
    if (typeof window !== 'undefined') {
      // Moderne Browser
      if ('showSaveFilePicker' in window) {
        // File System Access API (Chrome, Edge)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = filename
        
        document.body.appendChild(a)
        a.click()
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, 100)
        
        console.log('Download triggered via blob URL')
      } else {
        // Fallback für ältere Browser
        const blob = new Blob([jsonString], { type: 'application/json' })
        
        if ((navigator as any).msSaveBlob) {
          // Internet Explorer
          (navigator as any).msSaveBlob(blob, filename)
          console.log('Download triggered via msSaveBlob')
        } else {
          // Standard download
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          
          a.style.display = 'none'
          a.href = url
          a.download = filename
          a.target = '_blank'
          
          document.body.appendChild(a)
          a.click()
          
          // Cleanup nach kurzer Verzögerung
          setTimeout(() => {
            if (document.body.contains(a)) {
              document.body.removeChild(a)
            }
            URL.revokeObjectURL(url)
          }, 100)
          
          console.log('Download triggered via standard method')
        }
      }
    } else {
      throw new Error('Window object not available')
    }
  } catch (error) {
    console.error('Error in downloadJsonFile:', error)
    
    // Fallback: Show data in new window
    try {
      const jsonString = JSON.stringify(data, null, 2)
      const newWindow = window.open('')
      if (newWindow) {
        newWindow.document.write(`<pre>${jsonString}</pre>`)
        newWindow.document.title = filename
        console.log('Fallback: Opened data in new window')
      } else {
        // Last resort: Copy to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(jsonString)
          alert(`Download fehlgeschlagen. Daten wurden in die Zwischenablage kopiert.\nDateiname: ${filename}`)
        } else {
          alert(`Download fehlgeschlagen. Bitte öffnen Sie die Entwicklertools und kopieren Sie die Daten aus der Konsole.\nDateiname: ${filename}`)
          console.log('JSON Data:', jsonString)
        }
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      alert('Download fehlgeschlagen. Bitte versuchen Sie es erneut oder öffnen Sie die Entwicklertools.')
    }
  }
}
