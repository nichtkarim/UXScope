'use client'

import { useState, useEffect } from 'react'
import { Clock, Download, Trash2, Eye } from 'lucide-react'
import { analysisHistory, AnalysisHistory } from '@/lib/storage'
import { profileStorage } from '@/lib/storage'

interface AnalysisHistoryViewProps {
  onLoadAnalysis?: (analysis: AnalysisHistory) => void
}

export default function AnalysisHistoryView({ onLoadAnalysis }: AnalysisHistoryViewProps) {
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistory | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setHistory(analysisHistory.getHistory())
    setProfiles(profileStorage.getProfiles())
  }, [])

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diese Analyse wirklich löschen?')) {
      analysisHistory.deleteAnalysis(id)
      setHistory(analysisHistory.getHistory())
    }
  }

  const handleExport = (analysis: AnalysisHistory) => {
    const profile = profiles.find(p => p.id === analysis.profileId)
    const reportContent = `
USABILITY-ANALYSE BERICHT
========================

Datum: ${analysis.timestamp.toLocaleDateString('de-DE')}
Zeit: ${analysis.timestamp.toLocaleTimeString('de-DE')}
Profil: ${profile?.name || 'Unbekannt'}

KONTEXT:
${analysis.contextDescription}

ANALYSE:
${analysis.analysis}

---
Erstellt mit Usability Tester
    `.trim()

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Usability-Analyse-${analysis.timestamp.toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleView = (analysis: AnalysisHistory) => {
    setSelectedAnalysis(analysis)
    setIsModalOpen(true)
  }

  if (history.length === 0) {
    return (
      <div className="bg-secondary/50 rounded-lg p-8 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Keine Analyse-Historie
        </h3>
        <p className="text-muted-foreground">
          Ihre durchgeführten Analysen werden hier gespeichert.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Analyse-Historie</h2>
      </div>

      <div className="space-y-3">
        {history.map((analysis) => {
          const profile = profiles.find(p => p.id === analysis.profileId)
          return (
            <div
              key={analysis.id}
              className="bg-background border border-border rounded-lg p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {analysis.timestamp.toLocaleDateString('de-DE')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {analysis.timestamp.toLocaleTimeString('de-DE')}
                    </span>
                    {profile && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {profile.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {analysis.contextDescription}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => handleView(analysis)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Analyse anzeigen"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleExport(analysis)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Exportieren"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(analysis.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                    title="Löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal für Analyse-Details */}
      {isModalOpen && selectedAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Analyse vom {selectedAnalysis.timestamp.toLocaleDateString('de-DE')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Kontext:</h4>
                <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded">
                  {selectedAnalysis.contextDescription}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Analyse:</h4>
                <div className="text-sm prose prose-sm max-w-none">
                  {selectedAnalysis.analysis.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handleExport(selectedAnalysis)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm hover:bg-primary/90"
              >
                Exportieren
              </button>
              {onLoadAnalysis && (
                <button
                  onClick={() => {
                    onLoadAnalysis(selectedAnalysis)
                    setIsModalOpen(false)
                  }}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm hover:bg-secondary/80"
                >
                  Erneut laden
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
