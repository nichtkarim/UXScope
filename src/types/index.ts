export interface Profile {
  id: string
  name: string
  email: string
  selectedModel: string
  apiKey: string
  createdAt?: Date
}

export interface AppContext {
  appDescription: string
  userTask: string
  screenshot: string
  sourceCode?: string
  viewName: string
  customPrompt?: string
}


