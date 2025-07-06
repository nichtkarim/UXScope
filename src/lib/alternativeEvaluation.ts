import { UsabilityProblem, LLMAnalysis } from '@/types'

/**
 * Alternative Bewertungsmethodik für LLM-basierte Usability-Evaluation
 * Basierend auf wissenschaftlicher Erkenntnis, dass Precision/Recall für Usability ungeeignet sind
 */

export interface QualitativeEvaluationMetrics {
  // Qualitative Inhaltsanalyse
  problemCategorization: {
    nielsen: Record<string, number>
    depth: { superficial: number; deep: number; comprehensive: number }
    practicalRelevance: { high: number; medium: number; low: number }
  }
  
  // Konsistenz-Analyse
  consistency: {
    reproducibility: number // 0-1 Score
    stability: number // 0-1 Score
    systematicity: number // 0-1 Score
  }
  
  // Methodische Bewertungskriterien
  completeness: {
    dimensionsCovered: string[]
    contextConsideration: number // 0-1 Score
    subtleProblemsFound: number
  }
  
  // Qualität der Begründungen
  reasoningQuality: {
    clarity: number // 0-1 Score
    specificityScore: number // 0-1 Score
    actionability: number // 0-1 Score
  }
  
  // LLM-spezifische Stärken
  uniqueContributions: {
    problemsOnlyFoundByThisLLM: UsabilityProblem[]
    distinctivePerspectives: string[]
  }
}

export interface ComparativeEvaluation {
  llmName: string
  totalProblems: number
  qualitativeMetrics: QualitativeEvaluationMetrics
  strengthsAndWeaknesses: {
    strengths: string[]
    weaknesses: string[]
  }
}

export class AlternativeUsabilityEvaluator {
  /**
   * Haupt-Evaluationsmethode basierend auf qualitativen Kriterien
   */
  static evaluateQualitatively(
    llmAnalysis: LLMAnalysis,
    allAnalyses: LLMAnalysis[]
  ): ComparativeEvaluation {
    const problems = llmAnalysis.problems
    
    return {
      llmName: llmAnalysis.llmName,
      totalProblems: problems.length,
      qualitativeMetrics: this.calculateQualitativeMetrics(problems, allAnalyses),
      strengthsAndWeaknesses: this.analyzeStrengthsAndWeaknesses(llmAnalysis, allAnalyses)
    }
  }
  
  /**
   * Berechnet qualitative Metriken basierend auf wissenschaftlichen Kriterien
   */
  private static calculateQualitativeMetrics(
    problems: UsabilityProblem[],
    allAnalyses: LLMAnalysis[]
  ): QualitativeEvaluationMetrics {
    return {
      problemCategorization: this.categorizeProblemsByNielsen(problems),
      consistency: this.assessConsistency(problems),
      completeness: this.assessCompleteness(problems),
      reasoningQuality: this.assessReasoningQuality(problems),
      uniqueContributions: this.findUniqueContributions(problems, allAnalyses)
    }
  }
  
  /**
   * Kategorisiert Probleme nach Nielsen-Heuristiken
   */
  private static categorizeProblemsByNielsen(problems: UsabilityProblem[]) {
    const nielsenCategories: Record<string, number> = {
      'Visibility of System Status': 0,
      'Match Between System and Real World': 0,
      'User Control and Freedom': 0,
      'Consistency and Standards': 0,
      'Error Prevention': 0,
      'Recognition Rather Than Recall': 0,
      'Flexibility and Efficiency': 0,
      'Aesthetic and Minimalist Design': 0,
      'Help Users Recognize Errors': 0,
      'Help and Documentation': 0,
      'Uncategorized': 0
    }
    
    const depth = { superficial: 0, deep: 0, comprehensive: 0 }
    const practicalRelevance = { high: 0, medium: 0, low: 0 }
    
    problems.forEach(problem => {
      // Kategorisierung nach Nielsen (vereinfacht - in der Praxis würde man NLP verwenden)
      const category = this.categorizeByKeywords(problem.description)
      if (category in nielsenCategories) {
        nielsenCategories[category]++
      } else {
        nielsenCategories['Uncategorized']++
      }
      
      // Tiefe der Analyse (basierend auf Beschreibungslänge und Spezifität)
      const depthScore = this.assessProblemDepth(problem.description)
      if (depthScore > 0.7) depth.comprehensive++
      else if (depthScore > 0.4) depth.deep++
      else depth.superficial++
      
      // Praktische Relevanz (basierend auf Actionability)
      const relevanceScore = this.assessPracticalRelevance(problem.description)
      if (relevanceScore > 0.7) practicalRelevance.high++
      else if (relevanceScore > 0.4) practicalRelevance.medium++
      else practicalRelevance.low++
    })
    
    return { nielsen: nielsenCategories, depth, practicalRelevance }
  }
  
  /**
   * Bewertet die Konsistenz der LLM-Analyse
   */
  private static assessConsistency(problems: UsabilityProblem[]) {
    // Vereinfachte Konsistenz-Bewertung
    // In der Praxis würde man mehrere Durchläufe mit identischen Prompts vergleichen
    
    const uniqueProblems = new Set(problems.map(p => p.description.toLowerCase().trim()))
    const reproducibility = uniqueProblems.size / Math.max(problems.length, 1) // Weniger Duplikate = höhere Reproduzierbarkeit
    
    const systematicity = this.assessSystematicity(problems)
    
    return {
      reproducibility: Math.min(reproducibility, 1),
      stability: 0.8, // Platzhalter - würde durch Prompt-Variationen getestet
      systematicity
    }
  }
  
  /**
   * Bewertet die Vollständigkeit der Analyse
   */
  private static assessCompleteness(problems: UsabilityProblem[]) {
    const dimensionsCovered = this.identifyUsabilityDimensions(problems)
    const contextConsideration = this.assessContextConsideration(problems)
    const subtleProblemsFound = problems.filter(p => 
      this.isSubtleProblem(p.description)
    ).length
    
    return {
      dimensionsCovered,
      contextConsideration,
      subtleProblemsFound
    }
  }
  
  /**
   * Bewertet die Qualität der Begründungen
   */
  private static assessReasoningQuality(problems: UsabilityProblem[]) {
    const descriptions = problems.map(p => p.description)
    
    const clarity = this.assessClarity(descriptions)
    const specificityScore = this.assessSpecificity(descriptions)
    const actionability = this.assessActionability(descriptions)
    
    return {
      clarity,
      specificityScore,
      actionability
    }
  }
  
  /**
   * Findet einzigartige Beiträge des LLMs
   */
  private static findUniqueContributions(
    problems: UsabilityProblem[],
    allAnalyses: LLMAnalysis[]
  ) {
    const otherProblems = allAnalyses
      .flatMap(a => a.problems)
      .filter(p => !problems.includes(p))
    
    const uniqueProblems = problems.filter(problem => 
      !otherProblems.some(other => 
        this.problemsSimilar(problem.description, other.description)
      )
    )
    
    const distinctivePerspectives = this.identifyDistinctivePerspectives(problems, otherProblems)
    
    return {
      problemsOnlyFoundByThisLLM: uniqueProblems,
      distinctivePerspectives
    }
  }
  
  /**
   * Analysiert Stärken und Schwächen des LLMs
   */
  private static analyzeStrengthsAndWeaknesses(
    llmAnalysis: LLMAnalysis,
    allAnalyses: LLMAnalysis[]
  ) {
    const strengths: string[] = []
    const weaknesses: string[] = []
    
    const metrics = this.calculateQualitativeMetrics(llmAnalysis.problems, allAnalyses)
    
    // Stärken identifizieren
    if (metrics.reasoningQuality.clarity > 0.7) {
      strengths.push('Sehr klare und verständliche Problembeschreibungen')
    }
    
    if (metrics.completeness.dimensionsCovered.length > 7) {
      strengths.push('Umfassende Abdeckung verschiedener Usability-Dimensionen')
    }
    
    if (metrics.uniqueContributions.problemsOnlyFoundByThisLLM.length > 0) {
      strengths.push('Identifiziert einzigartige Usability-Probleme')
    }
    
    if (metrics.problemCategorization.depth.comprehensive > metrics.problemCategorization.depth.superficial) {
      strengths.push('Tiefgreifende Analyse mit detaillierten Insights')
    }
    
    // Schwächen identifizieren
    if (metrics.consistency.reproducibility < 0.5) {
      weaknesses.push('Inkonsistente Ergebnisse mit vielen Duplikaten')
    }
    
    if (metrics.reasoningQuality.actionability < 0.5) {
      weaknesses.push('Problembeschreibungen schwer umsetzbar für Designer')
    }
    
    if (metrics.problemCategorization.practicalRelevance.low > metrics.problemCategorization.practicalRelevance.high) {
      weaknesses.push('Viele Probleme mit geringer praktischer Relevanz')
    }
    
    return { strengths, weaknesses }
  }
  
  // Hilfsmethoden
  private static categorizeByKeywords(description: string): string {
    const keywords = {
      'Visibility of System Status': ['status', 'feedback', 'loading', 'progress'],
      'Match Between System and Real World': ['metaphor', 'familiar', 'convention', 'language'],
      'User Control and Freedom': ['undo', 'cancel', 'back', 'exit', 'control'],
      'Consistency and Standards': ['consistent', 'standard', 'pattern', 'convention'],
      'Error Prevention': ['prevent', 'error', 'mistake', 'validation'],
      'Recognition Rather Than Recall': ['recognize', 'remember', 'memory', 'recall'],
      'Flexibility and Efficiency': ['shortcut', 'efficient', 'flexible', 'customize'],
      'Aesthetic and Minimalist Design': ['clutter', 'simple', 'clean', 'minimal'],
      'Help Users Recognize Errors': ['error message', 'clear', 'explain', 'solution'],
      'Help and Documentation': ['help', 'documentation', 'guide', 'instruction']
    }
    
    const desc = description.toLowerCase()
    for (const [category, keywordList] of Object.entries(keywords)) {
      if (keywordList.some(keyword => desc.includes(keyword))) {
        return category
      }
    }
    
    return 'Uncategorized'
  }
  
  private static assessProblemDepth(description: string): number {
    // Vereinfachte Tiefe-Bewertung
    const indicators = {
      comprehensive: ['impact', 'consequence', 'user behavior', 'workflow', 'business goal'],
      deep: ['because', 'therefore', 'leads to', 'causes', 'results in'],
      superficial: ['bad', 'good', 'nice', 'ugly', 'confusing']
    }
    
    const desc = description.toLowerCase()
    if (indicators.comprehensive.some(ind => desc.includes(ind))) return 0.8
    if (indicators.deep.some(ind => desc.includes(ind))) return 0.6
    if (indicators.superficial.some(ind => desc.includes(ind))) return 0.2
    
    return 0.5 // Neutral
  }
  
  private static assessPracticalRelevance(description: string): number {
    // Vereinfachte Relevanz-Bewertung
    const actionableWords = ['should', 'could', 'improve', 'change', 'add', 'remove', 'modify']
    const specificWords = ['button', 'menu', 'icon', 'text', 'color', 'size', 'position']
    
    const desc = description.toLowerCase()
    let score = 0.5
    
    if (actionableWords.some(word => desc.includes(word))) score += 0.2
    if (specificWords.some(word => desc.includes(word))) score += 0.2
    if (desc.length > 50) score += 0.1 // Längere Beschreibungen sind oft spezifischer
    
    return Math.min(score, 1.0)
  }
  
  private static assessSystematicity(problems: UsabilityProblem[]): number {
    // Bewertet, ob das LLM einer erkennbaren Analysestrategie folgt
    const categories = problems.map(p => this.categorizeByKeywords(p.description))
    const uniqueCategories = new Set(categories)
    
    // Mehr verschiedene Kategorien = systematischer
    return Math.min(uniqueCategories.size / 8, 1.0) // Max 8 Hauptkategorien
  }
  
  private static identifyUsabilityDimensions(problems: UsabilityProblem[]): string[] {
    const dimensions = new Set<string>()
    
    problems.forEach(problem => {
      const category = this.categorizeByKeywords(problem.description)
      if (category !== 'Uncategorized') {
        dimensions.add(category)
      }
    })
    
    return Array.from(dimensions)
  }
  
  private static assessContextConsideration(problems: UsabilityProblem[]): number {
    // Bewertet, ob das LLM den Kontext der Anwendung berücksichtigt
    const contextIndicators = ['user', 'task', 'goal', 'scenario', 'context', 'situation']
    
    const contextAwareProblems = problems.filter(p => 
      contextIndicators.some(indicator => 
        p.description.toLowerCase().includes(indicator)
      )
    )
    
    return contextAwareProblems.length / Math.max(problems.length, 1)
  }
  
  private static isSubtleProblem(description: string): boolean {
    // Identifiziert subtile vs. offensichtliche Probleme
    const subtleIndicators = ['subtle', 'nuanced', 'implicit', 'underlying', 'hidden', 'cognitive load']
    const obviousIndicators = ['obvious', 'clear', 'visible', 'broken', 'missing']
    
    const desc = description.toLowerCase()
    return subtleIndicators.some(ind => desc.includes(ind)) && 
           !obviousIndicators.some(ind => desc.includes(ind))
  }
  
  private static assessClarity(descriptions: string[]): number {
    // Vereinfachte Klarheits-Bewertung
    const totalWords = descriptions.reduce((sum, desc) => sum + desc.split(' ').length, 0)
    const avgWordsPerProblem = totalWords / Math.max(descriptions.length, 1)
    
    // Zu kurz = unklar, zu lang = verschachtelt
    const clarityScore = avgWordsPerProblem > 10 && avgWordsPerProblem < 50 ? 0.8 : 0.5
    
    return clarityScore
  }
  
  private static assessSpecificity(descriptions: string[]): number {
    // Bewertet Spezifität der Problembeschreibungen
    const specificWords = ['button', 'menu', 'icon', 'text', 'color', 'size', 'position', 'screen', 'page']
    const vaguePhrases = ['something', 'things', 'stuff', 'maybe', 'might', 'could be']
    
    let specificityScore = 0
    descriptions.forEach(desc => {
      const hasSpecificWords = specificWords.some(word => desc.toLowerCase().includes(word))
      const hasVaguePhrases = vaguePhrases.some(phrase => desc.toLowerCase().includes(phrase))
      
      if (hasSpecificWords && !hasVaguePhrases) specificityScore += 1
      else if (hasSpecificWords || !hasVaguePhrases) specificityScore += 0.5
    })
    
    return specificityScore / Math.max(descriptions.length, 1)
  }
  
  private static assessActionability(descriptions: string[]): number {
    // Bewertet, ob Probleme umsetzbare Verbesserungsvorschläge enthalten
    const actionableWords = ['should', 'could', 'improve', 'change', 'add', 'remove', 'modify', 'consider']
    
    const actionableProblems = descriptions.filter(desc => 
      actionableWords.some(word => desc.toLowerCase().includes(word))
    )
    
    return actionableProblems.length / Math.max(descriptions.length, 1)
  }
  
  private static problemsSimilar(desc1: string, desc2: string): boolean {
    // Vereinfachte Ähnlichkeits-Bewertung
    const words1 = new Set(desc1.toLowerCase().split(' '))
    const words2 = new Set(desc2.toLowerCase().split(' '))
    
    const intersection = new Set([...words1].filter(word => words2.has(word)))
    const union = new Set([...words1, ...words2])
    
    const jaccardSimilarity = intersection.size / union.size
    return jaccardSimilarity > 0.5 // 50% Ähnlichkeit als Schwelle
  }
  
  private static identifyDistinctivePerspectives(
    problems: UsabilityProblem[],
    otherProblems: UsabilityProblem[]
  ): string[] {
    const perspectives: string[] = []
    
    const myCategories = problems.map(p => this.categorizeByKeywords(p.description))
    const otherCategories = otherProblems.map(p => this.categorizeByKeywords(p.description))
    
    const uniqueCategories = myCategories.filter(cat => 
      !otherCategories.includes(cat) && cat !== 'Uncategorized'
    )
    
    uniqueCategories.forEach(category => {
      perspectives.push(`Fokus auf ${category}`)
    })
    
    return perspectives
  }
  
  /**
   * Generiert einen qualitativen Vergleichsbericht
   */
  static generateQualitativeReport(evaluations: ComparativeEvaluation[]): string {
    let report = "# Qualitative Evaluation der LLM-basierten Usability-Analyse\n\n"
    
    report += "## Zusammenfassung\n\n"
    report += "Diese Evaluation verwendet wissenschaftlich fundierte qualitative Kriterien anstatt fragwürdiger Precision/Recall-Metriken.\n\n"
    
    evaluations.forEach(evaluation => {
      report += `## ${evaluation.llmName}\n\n`
      report += `**Gefundene Probleme:** ${evaluation.totalProblems}\n\n`
      
      report += "### Stärken\n"
      evaluation.strengthsAndWeaknesses.strengths.forEach(strength => {
        report += `- ${strength}\n`
      })
      
      report += "\n### Schwächen\n"
      evaluation.strengthsAndWeaknesses.weaknesses.forEach(weakness => {
        report += `- ${weakness}\n`
      })
      
      report += "\n### Einzigartige Beiträge\n"
      report += `- ${evaluation.qualitativeMetrics.uniqueContributions.problemsOnlyFoundByThisLLM.length} einzigartige Probleme identifiziert\n`
      evaluation.qualitativeMetrics.uniqueContributions.distinctivePerspectives.forEach(perspective => {
        report += `- ${perspective}\n`
      })
      
      report += "\n---\n\n"
    })
    
    return report
  }
}
