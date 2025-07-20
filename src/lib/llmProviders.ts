export interface LLMConfig {
  id: string
  name: string
  description: string
  provider: 'openai' | 'anthropic' | 'together' | 'local' | 'grok'
  requiresApiKey: boolean
  supportsVision: boolean
  modelId?: string
}

export const LLM_MODELS: Record<string, LLMConfig> = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Advanced multimodal model with strong reasoning capabilities',
    provider: 'openai',
    requiresApiKey: true,
    supportsVision: true,
    modelId: 'gpt-4o'
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Cost-efficient small model with multimodal capabilities',
    provider: 'openai',
    requiresApiKey: true,
    supportsVision: true,
    modelId: 'gpt-4o-mini'
  },
  'claude-3-5-sonnet': {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic\'s latest model for complex reasoning and analysis',
    provider: 'anthropic',
    requiresApiKey: true,
    supportsVision: true,
    modelId: 'claude-3-5-sonnet-20241022'
  },
  'claude-3-opus': {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Anthropics leistungsstärkstes Modell mit außergewöhnlichen Analyse-Fähigkeiten',
    provider: 'anthropic',
    requiresApiKey: true,
    supportsVision: true,
    modelId: 'claude-3-opus-20240229'
  },
  'claude-3-sonnet': {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    description: 'Ausgewogenes Claude 3 Modell mit exzellenter Leistung und Effizienz',
    provider: 'anthropic',
    requiresApiKey: true,
    supportsVision: true,
    modelId: 'claude-3-sonnet-20240229'
  },
  'claude-3-haiku': {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fast and cost-efficient model for simple tasks',
    provider: 'anthropic',
    requiresApiKey: true,
    supportsVision: true,
    modelId: 'claude-3-haiku-20240307'
  },
  'llama-3.1-70b': {
    id: 'llama-3.1-70b',
    name: 'Llama 3.1 70B',
    description: 'Meta\'s open-source model via Together AI',
    provider: 'together',
    requiresApiKey: true,
    supportsVision: false,
    modelId: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
  },
  'llama-3.1-8b': {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B',
    description: 'Smaller, faster version of Llama 3.1',
    provider: 'together',
    requiresApiKey: true,
    supportsVision: false,
    modelId: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
  },
  'llama-3.2-11b-vision': {
    id: 'llama-3.2-11b-vision',
    name: 'Llama 3.2 11B Vision',
    description: 'Vision-capable Llama model',
    provider: 'together',
    requiresApiKey: true,
    supportsVision: true,
    modelId: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo'
  },
  'ollama-llama3': {
    id: 'ollama-llama3',
    name: 'Llama 3 (Local)',
    description: 'Local Llama 3 model via Ollama',
    provider: 'local',
    requiresApiKey: false,
    supportsVision: false,
    modelId: 'llama3'
  },
  'grok-beta': {
    id: 'grok-beta',
    name: 'Grok 4',
    description: 'xAI\'s Grok 4 model with advanced reasoning and real-time information',
    provider: 'grok',
    requiresApiKey: true,
    supportsVision: false,
    modelId: 'grok-4'
  },
  'grok-vision-beta': {
    id: 'grok-vision-beta',
    name: 'Grok 4 Vision',
    description: 'Grok 4 model with enhanced vision capabilities',
    provider: 'grok',
    requiresApiKey: true,
    supportsVision: true,
    modelId: 'grok-4'
  }
}

export function validateApiKey(provider: string, apiKey: string): boolean {
  if (!apiKey) return false
  
  switch (provider) {
    case 'openai':
      return apiKey.startsWith('sk-')
    case 'anthropic':
      return apiKey.startsWith('sk-ant-')
    case 'together':
      return apiKey.length > 10
    case 'grok':
      return apiKey.startsWith('xai-') || apiKey.length > 10 // Grok API keys start with 'xai-' or are longer strings
    case 'local':
      return true
    default:
      return false
  }
}

async function createOpenAIClient(apiKey: string): Promise<any> {
  try {
    const { default: OpenAI } = await import('openai')
    return new OpenAI({ apiKey })
  } catch (error) {
    console.error('Failed to import OpenAI SDK:', error)
    throw new Error('OpenAI SDK not available. Please install with: npm install openai')
  }
}

async function createAnthropicClient(apiKey: string): Promise<any> {
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    return new Anthropic({ apiKey })
  } catch (error) {
    console.error('Failed to import Anthropic SDK:', error)
    throw new Error('Anthropic SDK not available. Please install with: npm install @anthropic-ai/sdk')
  }
}

async function createTogetherClient(apiKey: string): Promise<any> {
  try {
    const { default: Together } = await import('together-ai')
    return new Together({ apiKey })
  } catch (error) {
    console.error('Failed to import Together SDK:', error)
    throw new Error('Together SDK not available. Please install with: npm install together-ai')
  }
}

async function createGrokClient(apiKey: string): Promise<any> {
  try {
    const { default: OpenAI } = await import('openai')
    return new OpenAI({ 
      apiKey,
      baseURL: 'https://api.x.ai/v1'
    })
  } catch (error) {
    console.error('Failed to import OpenAI SDK for Grok:', error)
    throw new Error('OpenAI SDK not available for Grok. Please install with: npm install openai')
  }
}

async function createLLMClient(modelId: string, apiKey: string): Promise<any> {
  const config = LLM_MODELS[modelId]
  if (!config) {
    throw new Error(`Unknown model: ${modelId}`)
  }

  switch (config.provider) {
    case 'openai':
      return await createOpenAIClient(apiKey)

    case 'anthropic':
      return await createAnthropicClient(apiKey)

    case 'together':
      return await createTogetherClient(apiKey)

    case 'grok':
      return await createGrokClient(apiKey)

    case 'local':
      return null

    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }
}

async function generateResponse(
  client: any,
  modelConfig: LLMConfig,
  messages: any[],
  includeImages: boolean = false
): Promise<string> {
  switch (modelConfig.provider) {
    case 'openai': {
      const completion = await client.chat.completions.create({
        model: modelConfig.modelId,
        messages,
        max_tokens: 2000,
        temperature: 0.7
      })
      return completion.choices[0]?.message?.content || 'No response generated'
    }

    case 'anthropic': {
      const completion = await client.messages.create({
        model: modelConfig.modelId,
        max_tokens: 2000,
        temperature: 0.7,
        messages
      })
      return completion.content[0]?.text || 'No response generated'
    }

    case 'together': {
      const completion = await client.chat.completions.create({
        model: modelConfig.modelId,
        messages,
        max_tokens: 2000,
        temperature: 0.7
      })
      return completion.choices[0]?.message?.content || 'No response generated'
    }

    case 'grok': {
      try {
        // Ultra-aggressive ASCII-only Bereinigung für Grok
        const cleanText = (text: string): string => {
          // Schritt 1: Unicode in einfache ASCII-Zeichen umwandeln
          let cleaned = text
            // Deutsche Umlaute
            .replace(/[äÄ]/g, 'ae')
            .replace(/[öÖ]/g, 'oe')
            .replace(/[üÜ]/g, 'ue')
            .replace(/ß/g, 'ss')
            // Alle typografischen Anführungszeichen
            .replace(/[""„«»]/g, '"')
            .replace(/[''‚‹›]/g, "'")
            // Alle Gedankenstriche
            .replace(/[–—]/g, '-')
            .replace(/…/g, '...')
            // Alle anderen diakritischen Zeichen
            .replace(/[àáâãåæçèéêëìíîïñòóôõøùúûý]/gi, function(match) {
              const chars = 'aaaaaaeceeeeiiiinoooooouuuy'
              const index = 'àáâãåæçèéêëìíîïñòóôõøùúûý'.indexOf(match.toLowerCase())
              return index >= 0 ? chars[index] : match
            })
          
          // Schritt 2: Byte-für-Byte prüfen und nur sichere ASCII behalten
          let result = ''
          for (let i = 0; i < cleaned.length; i++) {
            const char = cleaned[i]
            const code = char.charCodeAt(0)
            
            // Nur ASCII-Zeichen 32-126 (druckbare Zeichen) + Newline (10) + Tab (9)
            if ((code >= 32 && code <= 126) || code === 10 || code === 9) {
              result += char
            } else {
              // Alle anderen Zeichen durch Leerzeichen ersetzen
              result += ' '
            }
          }
          
          return result.replace(/\s+/g, ' ').trim()
        }

        const cleanMessages = messages.map(message => {
          if (typeof message.content === 'string') {
            return { ...message, content: cleanText(message.content) }
          } else if (Array.isArray(message.content)) {
            // Für multimodale Nachrichten
            const cleanContent = message.content.map((part: any) => {
              if (part.type === 'text' && typeof part.text === 'string') {
                return { ...part, text: cleanText(part.text) }
              }
              return part
            })
            return { ...message, content: cleanContent }
          }
          return message
        })

        console.log('Grok: Sending cleaned messages.')
        // Debug: Prüfe auf problematische Zeichen
        cleanMessages.forEach((msg, index) => {
          const content = typeof msg.content === 'string' ? msg.content : 
            Array.isArray(msg.content) ? msg.content.map((p: any) => p.type === 'text' ? p.text : '[IMAGE]').join(' ') : '[UNKNOWN]'
          
          // Prüfe auf Zeichen außerhalb des ASCII-Bereichs
          for (let i = 0; i < content.length; i++) {
            const char = content[i]
            const code = char.charCodeAt(0)
            if (code > 126 || code < 32) {
              console.log(`Found problematic character: "${char}" (code: ${code}) at position ${i} in message ${index}`)
            }
          }
        })

        const completion = await client.chat.completions.create({
          model: modelConfig.modelId,
          messages: cleanMessages,
          max_tokens: 2000,
          temperature: 0.7
        })
        return completion.choices[0]?.message?.content || 'No response generated'
      } catch (grokError) {
        console.error('Grok API Error:', grokError)
        if (grokError instanceof Error) {
          throw new Error(`Grok API Error: ${grokError.message}`)
        }
        throw new Error('Grok API request failed')
      }
    }

    case 'local': {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelConfig.modelId,
          messages,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`Local model request failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.message?.content || 'No response generated'
    }

    default:
      throw new Error(`Unsupported provider: ${modelConfig.provider}`)
  }
}

export async function callLLM(
  modelId: string,
  apiKey: string,
  messages: any[],
  options: any = {}
): Promise<string> {
  try {
    const config = LLM_MODELS[modelId]
    if (!config) {
      throw new Error(`Unsupported model: ${modelId}`)
    }

    if (config.requiresApiKey && !validateApiKey(config.provider, apiKey)) {
      throw new Error('Invalid API key format')
    }

    const client = await createLLMClient(modelId, apiKey)
    return await generateResponse(client, config, messages, options.includeImages)
  } catch (error) {
    console.error(`LLM call failed for ${modelId}:`, error)
    
    const config = LLM_MODELS[modelId]
    if (config) {
      throw error
    } else {
      throw new Error(`Unknown model: ${modelId}`)
    }
  }
}
