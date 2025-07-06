'use client'

import { useState } from 'react'
import { BarChart3, Target, TrendingUp, AlertTriangle, CheckCircle, FileText } from 'lucide-react'
import { UsabilityProblem, EvaluationMetrics, LLMAnalysis } from '@/types'
import { UsabilityEvaluator } from '@/lib/evaluation'

interface ScientificEvaluationProps {
  llmAnalyses: LLMAnalysis[]
  groundTruth: UsabilityProblem[]
  onExportResults?: (results: any) => void
}

export default function ScientificEvaluation({ 
  llmAnalyses, 
  groundTruth, 
  onExportResults 
}: ScientificEvaluationProps) {
  const [selectedLLM, setSelectedLLM] = useState<string>('')
  
  if (llmAnalyses.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Wissenschaftliche Evaluation</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Keine Analysedaten verfügbar. Führen Sie mindestens eine LLM-Analyse durch, um die Evaluationsmetriken zu sehen.
          </p>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-400">
              Evaluationsmethodik
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Die Evaluation basiert auf direktem Vergleich mit der Ground Truth unter 
              Verwendung von Precision/Recall-Metriken sowie qualitativer Analyse der 
              Problemtypen entsprechend der wissenschaftlichen Methodik.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Berechne Metriken für alle LLMs
  const allMetrics = UsabilityEvaluator.compareMultipleLLMs(llmAnalyses, groundTruth)
  const qualitativeSummary = UsabilityEvaluator.generateQualitativeSummary(allMetrics, llmAnalyses)

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      llmAnalyses,
      groundTruth,
      metrics: allMetrics,
      qualitativeSummary,
      summary: {
        totalAnalyses: llmAnalyses.length,
        totalGroundTruthProblems: groundTruth.length,
        averagePrecision: Object.values(allMetrics).reduce((sum, m) => sum + m.precision, 0) / Object.keys(allMetrics).length,
        averageRecall: Object.values(allMetrics).reduce((sum, m) => sum + m.recall, 0) / Object.keys(allMetrics).length
      }
    }
    
    if (onExportResults) {
      onExportResults(exportData)
    } else {
      // Fallback: JSON Download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `usability-evaluation-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-secondary/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Wissenschaftliche Evaluation</h3>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Ergebnisse exportieren
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Precision/Recall-Analyse basierend auf der definierten Ground Truth für {llmAnalyses.length} LLM(s)
        </p>
      </div>

      {/* Übersichtsmetriken */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(allMetrics).map(([llmId, metrics]) => {
          const llmName = llmAnalyses.find(a => a.llmId === llmId)?.llmName || llmId
          return (
            <div key={llmId} className="bg-background rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-primary" />
                <h4 className="font-medium">{llmName}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Precision:</span>
                  <span className={`font-medium ${metrics.precision > 0.7 ? 'text-success' : metrics.precision > 0.4 ? 'text-warning' : 'text-error'}`}>
                    {(metrics.precision * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Recall:</span>
                  <span className={`font-medium ${metrics.recall > 0.7 ? 'text-success' : metrics.recall > 0.4 ? 'text-warning' : 'text-error'}`}>
                    {(metrics.recall * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  TP: {metrics.truePositives} | FP: {metrics.falsePositives} | FN: {metrics.falseNegatives}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detaillierte Analyse */}
      <div className="bg-secondary/50 rounded-lg p-6 border">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Detaillierte Metriken-Analyse
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">LLM für detaillierte Ansicht:</label>
            <select
              value={selectedLLM}
              onChange={(e) => setSelectedLLM(e.target.value)}
              className="w-full p-2 border border-border rounded bg-background text-foreground"
            >
              <option value="">Alle LLMs im Überblick</option>
              {llmAnalyses.map(analysis => (
                <option key={analysis.llmId} value={analysis.llmId}>
                  {analysis.llmName}
                </option>
              ))}
            </select>
          </div>

          {selectedLLM && allMetrics[selectedLLM] && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Fehlerverteilung</h5>
                  <div className="space-y-1">
                    {Object.entries(allMetrics[selectedLLM].errorDistribution).map(([errorType, count]) => (
                      <div key={errorType} className="flex justify-between text-sm">
                        <span>{errorType}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Einzigartige Beiträge</h5>
                  <p className="text-sm text-muted-foreground">
                    {allMetrics[selectedLLM].uniqueContributions.length} Probleme, die nur von diesem LLM identifiziert wurden
                  </p>
                  {allMetrics[selectedLLM].uniqueContributions.slice(0, 3).map((problem, index) => (
                    <div key={index} className="text-xs bg-info-soft p-2 rounded border border-info mt-1">
                      {problem.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Qualitative Zusammenfassung */}
      <div className="bg-secondary/50 rounded-lg p-6 border">
        <h4 className="font-medium mb-4">Qualitative Analyse</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <h5 className="font-medium text-success">Stärken</h5>
            </div>
            <ul className="space-y-1">
              {qualitativeSummary.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {strength}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <h5 className="font-medium text-warning">Schwächen</h5>
            </div>
            <ul className="space-y-1">
              {qualitativeSummary.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {weakness}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-info" />
              <h5 className="font-medium text-info">Empfehlungen</h5>
            </div>
            <ul className="space-y-1">
              {qualitativeSummary.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Methodische Hinweise */}
      <div className="bg-info-soft rounded-lg p-4 border border-info">
        <h5 className="font-medium text-info mb-2">Methodische Hinweise</h5>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• <strong>Precision</strong> misst den Anteil korrekt identifizierter Probleme (wenige falsche Alarme)</p>
          <p>• <strong>Recall</strong> misst die Vollständigkeit der Problemerkennung (wenige übersehene Probleme)</p>
          <p>• Die Ground Truth basiert auf systematischer HCD-Evaluation nach ISO 9241-210</p>
          <p>• Precision wird als Hauptindikator verwendet, da Recall bei komplexen Anwendungen schwer vollständig erfassbar ist</p>
        </div>
      </div>
    </div>
  )
}
