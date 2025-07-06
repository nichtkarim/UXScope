import { UsabilityProblem, EvaluationMetrics, LLMAnalysis } from '@/types'

/**
 * Evaluationsklasse für die Berechnung von Precision, Recall und anderen Metriken
 * Implementiert die in der Bachelorarbeit definierte Methodik
 */
export class UsabilityEvaluator {
  /**
   * Berechnet die Evaluationsmetriken für ein LLM gegen die Ground Truth
   */
  static calculateMetrics(
    llmProblems: UsabilityProblem[],
    groundTruth: UsabilityProblem[]
  ): EvaluationMetrics {
    const { truePositives, falsePositives, falseNegatives } = this.categorizeProblems(
      llmProblems,
      groundTruth
    )
    
    const precision = truePositives.length > 0 
      ? truePositives.length / (truePositives.length + falsePositives.length)
      : 0
    
    const recall = groundTruth.length > 0
      ? truePositives.length / (truePositives.length + falseNegatives.length)
      : 0
    
    const uniqueContributions = this.findUniqueContributions(llmProblems, groundTruth)
    const errorDistribution = this.analyzeErrorDistribution(falsePositives)
    
    return {
      truePositives: truePositives.length,
      falsePositives: falsePositives.length,
      falseNegatives: falseNegatives.length,
      precision,
      recall,
      uniqueContributions,
      errorDistribution
    }
  }
  
  /**
   * Kategorisiert die Probleme in True Positives, False Positives und False Negatives
   */
  private static categorizeProblems(
    llmProblems: UsabilityProblem[],
    groundTruth: UsabilityProblem[]
  ): {
    truePositives: UsabilityProblem[]
    falsePositives: UsabilityProblem[]
    falseNegatives: UsabilityProblem[]
  } {
    const truePositives: UsabilityProblem[] = []
    const falsePositives: UsabilityProblem[] = []
    const falseNegatives: UsabilityProblem[] = []
    
    // Finde True Positives und False Positives
    for (const llmProblem of llmProblems) {
      const matchingGroundTruth = this.findMatchingProblem(llmProblem, groundTruth)
      if (matchingGroundTruth) {
        truePositives.push(llmProblem)
      } else {
        falsePositives.push(llmProblem)
      }
    }
    
    // Finde False Negatives
    for (const truthProblem of groundTruth) {
      const matchingLLM = this.findMatchingProblem(truthProblem, llmProblems)
      if (!matchingLLM) {
        falseNegatives.push(truthProblem)
      }
    }
    
    return { truePositives, falsePositives, falseNegatives }
  }
  
  /**
   * Findet ein übereinstimmendes Problem basierend auf Ähnlichkeit
   * Implementiert semantische Ähnlichkeit für robuste Vergleiche
   */
  private static findMatchingProblem(
    problem: UsabilityProblem,
    problemList: UsabilityProblem[]
  ): UsabilityProblem | null {
    // Exakte Übereinstimmung
    const exactMatch = problemList.find(p => 
      p.title.toLowerCase() === problem.title.toLowerCase() ||
      p.description.toLowerCase() === problem.description.toLowerCase()
    )
    if (exactMatch) return exactMatch
    
    // Semantische Ähnlichkeit basierend auf Schlüsselwörtern
    const problemKeywords = this.extractKeywords(problem.title + ' ' + problem.description)
    
    for (const candidate of problemList) {
      const candidateKeywords = this.extractKeywords(candidate.title + ' ' + candidate.description)
      const similarity = this.calculateSimilarity(problemKeywords, candidateKeywords)
      
      if (similarity > 0.7) { // Schwellenwert für semantische Ähnlichkeit
        return candidate
      }
    }
    
    return null
  }
  
  /**
   * Extrahiert relevante Schlüsselwörter aus einem Text
   */
  private static extractKeywords(text: string): string[] {
    const stopWords = ['der', 'die', 'das', 'und', 'oder', 'aber', 'ist', 'sind', 'wird', 'werden', 'von', 'zu', 'mit', 'auf', 'für', 'in', 'an', 'bei', 'nach', 'vor', 'über', 'unter', 'durch']
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
  }
  
  /**
   * Berechnet die Ähnlichkeit zwischen zwei Schlüsselwort-Sets
   */
  private static calculateSimilarity(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 || keywords2.length === 0) return 0
    
    const intersection = keywords1.filter(word => keywords2.includes(word))
    const union = [...new Set([...keywords1, ...keywords2])]
    
    return intersection.length / union.length
  }
  
  /**
   * Identifiziert einzigartige Beiträge des LLMs
   */
  private static findUniqueContributions(
    llmProblems: UsabilityProblem[],
    groundTruth: UsabilityProblem[]
  ): UsabilityProblem[] {
    return llmProblems.filter(problem => 
      !this.findMatchingProblem(problem, groundTruth)
    ).filter(problem => 
      !problem.errorType || problem.errorType === 'No Usability Issue'
    )
  }
  
  /**
   * Analysiert die Verteilung der Fehlertypen
   */
  private static analyzeErrorDistribution(falsePositives: UsabilityProblem[]): { [key: string]: number } {
    const distribution: { [key: string]: number } = {
      'No Usability Issue': 0,
      'Uncertain': 0,
      'Irrelevant/Incorrect Statement': 0,
      'Duplicate': 0,
      'Unclassified': 0
    }
    
    for (const problem of falsePositives) {
      if (problem.errorType) {
        distribution[problem.errorType]++
      } else {
        distribution['Unclassified']++
      }
    }
    
    return distribution
  }
  
  /**
   * Vergleicht mehrere LLM-Analysen miteinander
   */
  static compareMultipleLLMs(
    analyses: LLMAnalysis[],
    groundTruth: UsabilityProblem[]
  ): {
    [llmId: string]: EvaluationMetrics
  } {
    const results: { [llmId: string]: EvaluationMetrics } = {}
    
    for (const analysis of analyses) {
      results[analysis.llmId] = this.calculateMetrics(analysis.problems, groundTruth)
    }
    
    return results
  }
  
  /**
   * Generiert eine qualitative Zusammenfassung der Ergebnisse
   */
  static generateQualitativeSummary(
    metrics: { [llmId: string]: EvaluationMetrics },
    llmAnalyses: LLMAnalysis[]
  ): {
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
  } {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []
    
    // Analysiere Stärken und Schwächen
    for (const [llmId, metric] of Object.entries(metrics)) {
      const llmName = llmAnalyses.find(a => a.llmId === llmId)?.llmName || llmId
      
      if (metric.precision > 0.8) {
        strengths.push(`${llmName} zeigt hohe Precision (${(metric.precision * 100).toFixed(1)}%) - wenige falsche Alarme`)
      }
      
      if (metric.recall > 0.7) {
        strengths.push(`${llmName} zeigt guten Recall (${(metric.recall * 100).toFixed(1)}%) - findet die meisten Probleme`)
      }
      
      if (metric.precision < 0.5) {
        weaknesses.push(`${llmName} hat niedrige Precision (${(metric.precision * 100).toFixed(1)}%) - viele falsche Alarme`)
      }
      
      if (metric.recall < 0.5) {
        weaknesses.push(`${llmName} hat niedrigen Recall (${(metric.recall * 100).toFixed(1)}%) - übersieht viele Probleme`)
      }
      
      if (metric.uniqueContributions.length > 0) {
        strengths.push(`${llmName} identifiziert ${metric.uniqueContributions.length} einzigartige Probleme`)
      }
    }
    
    // Generiere Empfehlungen
    const avgPrecision = Object.values(metrics).reduce((sum, m) => sum + m.precision, 0) / Object.keys(metrics).length
    const avgRecall = Object.values(metrics).reduce((sum, m) => sum + m.recall, 0) / Object.keys(metrics).length
    
    if (avgPrecision < 0.7) {
      recommendations.push('Prompt Engineering zur Reduzierung falscher Alarme überarbeiten')
    }
    
    if (avgRecall < 0.7) {
      recommendations.push('Prompt Engineering zur Verbesserung der Problemerkennung erweitern')
    }
    
    recommendations.push('Kombination mehrerer LLMs für bessere Abdeckung erwägen')
    recommendations.push('Iterative Prompt-Optimierung basierend auf Fehleranalyse durchführen')
    
    return { strengths, weaknesses, recommendations }
  }
}
