export interface LLMModel {
  id: string
  name: string
  description: string
  supportVision?: boolean
}

export interface Profile {
  id: string
  name: string
  email: string
  selectedModel: string
  apiKey: string
  createdAt?: Date
}



// Erweiterte Typen für die Bachelorarbeit-Methodik
export interface UsabilityProblem {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'nielsen' | 'iso' | 'wcag' | 'other'
  heuristic?: string
  detectedBy: string[] // Array von LLM-IDs
  isGroundTruth?: boolean
  errorType?: 'No Usability Issue' | 'Uncertain' | 'Irrelevant/Incorrect Statement' | 'Duplicate'
}

export interface AppContext {
  appDescription: string
  userTask: string
  screenshot: string
  sourceCode?: string
  viewName: string
  customPrompt?: string
}

export interface LLMAnalysis {
  llmId: string
  llmName: string
  problems: UsabilityProblem[]
  analysisTime: Date
  promptUsed: string
  rawResponse: string
}

export interface EvaluationMetrics {
  truePositives: number
  falsePositives: number
  falseNegatives: number
  precision: number
  recall: number
  uniqueContributions: UsabilityProblem[]
  errorDistribution: {
    [key: string]: number
  }
}


