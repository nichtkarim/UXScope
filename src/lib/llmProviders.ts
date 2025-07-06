import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import Together from 'together-ai'

export interface LLMConfig {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'together' | 'local'
  requiresApiKey: boolean
  supportsVision: boolean
  modelId?: string
}

export const LLM_MODELS: Record<string, LLMConfig> = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    requiresApiKey: true,
    supportsVision: true,
    modelId: 'gpt-4o'
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    requiresApiKey: true,
    supportsVision: true,
    modelId: 'gpt-4o-mini'
  },
  'claude-3-5-sonnet': {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    requiresApiKey: true,
    supportsVision: true,
    modelId: 'claude-3-5-sonnet-20241022'
  },
  'claude-3-haiku': {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    requiresApiKey: true,
    supportsVision: true,
    modelId: 'claude-3-haiku-20240307'
  },
  'llama-3.3-70b': {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'together',
    requiresApiKey: true,
    supportsVision: false,
    modelId: 'meta-llama/Llama-3.3-70B-Instruct-Turbo'
  },
  'llama-3.1-local': {
    id: 'llama-3.1-local',
    name: 'Llama 3.1 (Local)',
    provider: 'local',
    requiresApiKey: false,
    supportsVision: false,
    modelId: 'llama3.1'
  }
}

export const validateApiKey = (provider: string, apiKey: string): boolean => {
  if (!apiKey || apiKey.trim() === '') return false
  
  switch (provider) {
    case 'openai':
      return apiKey.startsWith('sk-') && apiKey.length > 20
    case 'anthropic':
      return apiKey.startsWith('sk-ant-') && apiKey.length > 20
    case 'together':
      return apiKey.length > 20 && !apiKey.startsWith('sk-')
    case 'local':
      return true // Local models don't need API keys
    default:
      return false
  }
}

export const callLLM = async (
  modelId: string,
  apiKey: string,
  messages: any[],
  options: any = {}
): Promise<string> => {
  const config = LLM_MODELS[modelId]
  if (!config) {
    throw new Error(`Unsupported model: ${modelId}`)
  }

  if (config.requiresApiKey && !validateApiKey(config.provider, apiKey)) {
    throw new Error('Invalid API key')
  }

  switch (config.provider) {
    case 'openai':
      return await callOpenAI(config.modelId!, apiKey, messages, options)
    case 'anthropic':
      return await callAnthropic(config.modelId!, apiKey, messages, options)
    case 'together':
      return await callTogether(config.modelId!, apiKey, messages, options)
    case 'local':
      return await callLocal(config.modelId!, messages, options)
    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }
}

async function callOpenAI(model: string, apiKey: string, messages: any[], options: any): Promise<string> {
  const openai = new OpenAI({ apiKey })
  
  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 2000,
  })

  return response.choices[0]?.message?.content || ''
}

async function callAnthropic(model: string, apiKey: string, messages: any[], options: any): Promise<string> {
  const anthropic = new Anthropic({ apiKey })
  
  // Convert OpenAI format to Anthropic format
  const systemMessage = messages.find(m => m.role === 'system')
  const userMessages = messages.filter(m => m.role !== 'system')
  
  const response = await anthropic.messages.create({
    model,
    max_tokens: options.max_tokens || 2000,
    system: systemMessage?.content || '',
    messages: userMessages,
    temperature: options.temperature || 0.7,
  })

  return response.content[0]?.type === 'text' ? response.content[0].text : ''
}

async function callTogether(model: string, apiKey: string, messages: any[], options: any): Promise<string> {
  const together = new Together({ apiKey })
  
  const response = await together.chat.completions.create({
    model,
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 2000,
  })

  return response.choices[0]?.message?.content || ''
}

async function callLocal(model: string, messages: any[], options: any): Promise<string> {
  // Call local Ollama instance
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.max_tokens || 2000,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Local LLM error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.message?.content || ''
}
