'use client'

import { BarChart3, Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface UsabilityAnalysisProps {
  analysis: string | null
  isAnalyzing: boolean
  onReset?: () => void
}

export default function UsabilityAnalysis({ analysis, isAnalyzing, onReset }: UsabilityAnalysisProps) {
  
  const exportReport = () => {
    if (!analysis) return
    
    // PDF Export funktionalität
    const reportContent = `
USABILITY-ANALYSE BERICHT
========================

Datum: ${new Date().toLocaleDateString('de-DE')}
Zeit: ${new Date().toLocaleTimeString('de-DE')}

${analysis}

---
Erstellt mit Usability Tester
    `.trim()
    
    // Als Text-Datei herunterladen
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Usability-Analyse-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    if (onReset) {
      onReset()
    }
  }
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Analyse läuft...
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Das LLM analysiert Ihre Anwendung nach Nielsen's Heuristiken und ISO-Standards. 
          Dies kann einen Moment dauern.
        </p>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Bereit für die Analyse
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Laden Sie einen Screenshot hoch, füllen Sie die Kontextfelder aus und 
          wählen Sie ein Profil, um die Usability-Analyse zu starten.
        </p>
      </div>
    )
  }

  // Parse the analysis (in a real app, this would be structured data)
  const sections = analysis.split('\n\n').filter(section => section.trim())

  const getScoreIcon = (text: string) => {
    if (text.includes('9/10') || text.includes('85%') || text.includes('✅')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (text.includes('7/10') || text.includes('78%') || text.includes('⚠️')) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
    if (text.includes('5/10') || text.includes('❌')) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    return null
  }

  return (
    <div className="space-y-6 max-h-96 overflow-y-auto">
      <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">Analyse abgeschlossen</span>
      </div>

      <div className="prose prose-sm max-w-none">
        {sections.map((section, index) => {
          const lines = section.split('\n').filter(line => line.trim())
          if (lines.length === 0) return null

          const isHeader = lines[0].startsWith('#')
          const isSubheader = lines[0].startsWith('**') && lines[0].endsWith('**')

          return (
            <div key={index} className="mb-4">
              {isHeader ? (
                <h3 className="text-lg font-semibold text-foreground mb-2 border-b border-border pb-1">
                  {lines[0].replace(/^#+\s*/, '')}
                </h3>
              ) : isSubheader ? (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    {getScoreIcon(section)}
                    <h4 className="font-medium text-foreground">
                      {lines[0].replace(/^\*\*|\*\*$/g, '')}
                    </h4>
                  </div>
                  <div className="ml-6 space-y-1">
                    {lines.slice(1).map((line, lineIndex) => (
                      <p key={lineIndex} className="text-sm text-muted-foreground">
                        {line.replace(/^- /, '')}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {lines.map((line, lineIndex) => {
                    if (line.startsWith('##')) {
                      return (
                        <h4 key={lineIndex} className="font-medium text-foreground mt-3 mb-1">
                          {line.replace(/^##\s*/, '')}
                        </h4>
                      )
                    }
                    if (line.startsWith('- ') || line.match(/^\d+\./)) {
                      return (
                        <p key={lineIndex} className="text-sm text-muted-foreground ml-4">
                          {line}
                        </p>
                      )
                    }
                    return (
                      <p key={lineIndex} className="text-sm text-foreground">
                        {line}
                      </p>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-border pt-4 space-y-2">
        <button 
          onClick={exportReport}
          disabled={!analysis}
          className="w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-lg text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Vollständigen Bericht exportieren
        </button>
        <button 
          onClick={handleReset}
          className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg text-sm hover:bg-primary/90 transition-colors"
        >
          Neue Analyse starten
        </button>
      </div>
    </div>
  )
}
