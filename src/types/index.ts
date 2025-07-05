export interface LLMModel {
  id: string
  name: string
  description: string
}

export interface Profile {
  id: string
  name: string
  email: string
  selectedModel: string
  createdAt: Date
}

export interface AnalysisResult {
  effectiveness: number
  efficiency: number
  satisfaction: number
  nielsenHeuristics: {
    [key: string]: {
      score: number
      feedback: string
    }
  }
  accessibility: {
    wcagCompliance: number
    issues: string[]
  }
  recommendations: string[]
}
