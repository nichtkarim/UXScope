'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  Brain, 
  Users, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Info,
  Eye,
  Lightbulb
} from 'lucide-react'
import { LLMAnalysis } from '@/types'
import { AlternativeUsabilityEvaluator, ComparativeEvaluation } from '@/lib/alternativeEvaluation'

interface AlternativeEvaluationProps {
  llmAnalyses: LLMAnalysis[]
  onExportResults?: (results: any) => void
}

export default function AlternativeEvaluation({ 
  llmAnalyses, 
  onExportResults 
}: AlternativeEvaluationProps) {
  const [selectedLLM, setSelectedLLM] = useState<string>('')
  const [showMethodologyWarning, setShowMethodologyWarning] = useState(true)
  
  if (llmAnalyses.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Alternative Evaluation</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Keine Analysedaten verfügbar. Führen Sie mindestens eine LLM-Analyse durch, um die qualitative Evaluation zu sehen.
          </p>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-400">
              Wissenschaftlich fundierte Methodik
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Diese Evaluation verwendet qualitative Forschungsmethoden anstatt fragwürdiger 
              Precision/Recall-Metriken. Fokus liegt auf Argumentationsqualität, Praktikabilität 
              und LLM-spezifischen Stärken.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Berechne qualitative Evaluationen für alle LLMs
  const evaluations: ComparativeEvaluation[] = llmAnalyses.map(analysis => 
    AlternativeUsabilityEvaluator.evaluateQualitatively(analysis, llmAnalyses)
  )

  const handleExport = () => {
    const qualitativeReport = AlternativeUsabilityEvaluator.generateQualitativeReport(evaluations)
    
    const exportData = {
      methodology: 'Alternative Qualitative Evaluation',
      timestamp: new Date().toISOString(),
      llmAnalyses,
      qualitativeEvaluations: evaluations,
      report: qualitativeReport,
      summary: {
        totalAnalyses: llmAnalyses.length,
        totalProblems: llmAnalyses.reduce((sum, analysis) => sum + analysis.problems.length, 0),
        averageProblemsPerLLM: llmAnalyses.reduce((sum, analysis) => sum + analysis.problems.length, 0) / llmAnalyses.length,
        uniqueInsights: evaluations.reduce((sum, evaluation) => sum + evaluation.qualitativeMetrics.uniqueContributions.problemsOnlyFoundByThisLLM.length, 0)
      }
    }
    
    if (onExportResults) {
      onExportResults(exportData)
    } else {
      // Fallback: Markdown Report Download
      const blob = new Blob([qualitativeReport], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `qualitative-evaluation-${new Date().toISOString().split('T')[0]}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const selectedEvaluation = selectedLLM ? evaluations.find(e => e.llmName === selectedLLM) : null

  return (
    <div className="space-y-6">
      {/* Methodology Warning */}
      {showMethodologyWarning && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                Wissenschaftliche Reflektion: Problematik von Precision/Recall
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Traditionelle ML-Metriken wie Precision/Recall sind für Usability-Evaluation ungeeignet, 
                da sie eine objektive "Ground Truth" voraussetzen, die bei subjektiven Usability-Bewertungen 
                nicht existiert. Diese alternative Methodik fokussiert auf qualitative Kriterien.
              </p>
              <button
                onClick={() => setShowMethodologyWarning(false)}
                className="text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-600 dark:hover:text-yellow-200 underline"
              >
                Verstanden, ausblenden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alternative Qualitative Evaluation</h3>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white dark:bg-blue-500 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Qualitativen Bericht exportieren
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Analysierte LLMs</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{llmAnalyses.length}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Gefundene Probleme</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {llmAnalyses.reduce((sum, analysis) => sum + analysis.problems.length, 0)}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Einzigartige Insights</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {evaluations.reduce((sum, evaluation) => sum + evaluation.qualitativeMetrics.uniqueContributions.problemsOnlyFoundByThisLLM.length, 0)}
            </div>
          </div>
        </div>
        
        {/* LLM Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100">LLM für Detailanalyse auswählen:</label>
          <select
            value={selectedLLM}
            onChange={(e) => setSelectedLLM(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Übersicht aller LLMs</option>
            {evaluations.map(evaluation => (
              <option key={evaluation.llmName} value={evaluation.llmName}>
                {evaluation.llmName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LLM Overview or Detailed View */}
      {selectedEvaluation ? (
        <DetailedEvaluationView evaluation={selectedEvaluation} />
      ) : (
        <OverviewEvaluationView evaluations={evaluations} />
      )}
    </div>
  )
}

// Detailed View für ein spezifisches LLM
function DetailedEvaluationView({ evaluation }: { evaluation: ComparativeEvaluation }) {
  const metrics = evaluation.qualitativeMetrics

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Detailanalyse: {evaluation.llmName}</h4>
        
        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h5 className="font-medium text-green-700 dark:text-green-400">Stärken</h5>
            </div>
            <ul className="space-y-1 text-sm">
              {evaluation.strengthsAndWeaknesses.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h5 className="font-medium text-red-700 dark:text-red-400">Schwächen</h5>
            </div>
            <ul className="space-y-1 text-sm">
              {evaluation.strengthsAndWeaknesses.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Qualitative Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Problem Categorization */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h5 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Nielsen-Heuristiken Abdeckung</h5>
            <div className="space-y-2">
              {Object.entries(metrics.problemCategorization.nielsen).map(([category, count]) => (
                count > 0 && (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs border border-blue-200 dark:border-blue-800">
                      {count}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>
          
          {/* Reasoning Quality */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h5 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Qualität der Begründungen</h5>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">Klarheit</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 dark:bg-blue-400 rounded-full" 
                      style={{ width: `${metrics.reasoningQuality.clarity * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{Math.round(metrics.reasoningQuality.clarity * 100)}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">Spezifität</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-2 bg-green-600 dark:bg-green-400 rounded-full" 
                      style={{ width: `${metrics.reasoningQuality.specificityScore * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">{Math.round(metrics.reasoningQuality.specificityScore * 100)}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">Umsetzbarkeit</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-2 bg-purple-600 dark:bg-purple-400 rounded-full" 
                      style={{ width: `${metrics.reasoningQuality.actionability * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">{Math.round(metrics.reasoningQuality.actionability * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Overview für alle LLMs
function OverviewEvaluationView({ evaluations }: { evaluations: ComparativeEvaluation[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Vergleichende Übersicht</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evaluations.map((evaluation, index) => (
            <div key={evaluation.llmName} className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  index === 0 ? 'bg-blue-600' : 
                  index === 1 ? 'bg-green-600' : 'bg-purple-600'
                }`} />
                <h5 className="font-medium text-gray-900 dark:text-gray-100">{evaluation.llmName}</h5>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Probleme gefunden:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{evaluation.totalProblems}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Einzigartige Insights:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {evaluation.qualitativeMetrics.uniqueContributions.problemsOnlyFoundByThisLLM.length}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Heuristiken abgedeckt:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {evaluation.qualitativeMetrics.completeness.dimensionsCovered.length}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div className="mb-1">
                    <strong>Top Stärke:</strong> {evaluation.strengthsAndWeaknesses.strengths[0] || 'N/A'}
                  </div>
                  <div>
                    <strong>Hauptschwäche:</strong> {evaluation.strengthsAndWeaknesses.weaknesses[0] || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Comparison Matrix */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Bewertungsmatrix</h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-2 text-gray-900 dark:text-gray-100">Kriterium</th>
                {evaluations.map(evaluation => (
                  <th key={evaluation.llmName} className="text-center p-2 text-gray-900 dark:text-gray-100">{evaluation.llmName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-2 font-medium text-gray-900 dark:text-gray-100">Problemvielfalt</td>
                {evaluations.map(evaluation => (
                  <td key={evaluation.llmName} className="text-center p-2 text-gray-700 dark:text-gray-300">
                    {evaluation.qualitativeMetrics.completeness.dimensionsCovered.length}/10
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-2 font-medium text-gray-900 dark:text-gray-100">Argumentationsqualität</td>
                {evaluations.map(evaluation => (
                  <td key={evaluation.llmName} className="text-center p-2 text-gray-700 dark:text-gray-300">
                    {Math.round(evaluation.qualitativeMetrics.reasoningQuality.clarity * 5)}/5
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-2 font-medium text-gray-900 dark:text-gray-100">Umsetzbarkeit</td>
                {evaluations.map(evaluation => (
                  <td key={evaluation.llmName} className="text-center p-2 text-gray-700 dark:text-gray-300">
                    {Math.round(evaluation.qualitativeMetrics.reasoningQuality.actionability * 5)}/5
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-medium text-gray-900 dark:text-gray-100">Einzigartige Beiträge</td>
                {evaluations.map(evaluation => (
                  <td key={evaluation.llmName} className="text-center p-2 text-gray-700 dark:text-gray-300">
                    {evaluation.qualitativeMetrics.uniqueContributions.problemsOnlyFoundByThisLLM.length}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
