import { LLMModel } from '@/types'

export const llmModels: LLMModel[] = [
  {
    id: 'llama3',
    name: 'Llama 3',
    description: 'Meta\'s advanced language model optimized for reasoning and code understanding'
  },
  {
    id: 'claude4',
    name: 'Claude 4',
    description: 'Anthropic\'s most capable model with strong analytical capabilities'
  },
  {
    id: 'gpt4o',
    name: 'GPT-4o',
    description: 'OpenAI\'s multimodal model with vision and text capabilities'
  },
  {
    id: 'gpt4.5',
    name: 'GPT-4.5',
    description: 'OpenAI\'s latest model with enhanced reasoning abilities'
  }
]

export const nielsenHeuristics = [
  'Sichtbarkeit des Systemstatus',
  'Übereinstimmung zwischen System und realer Welt',
  'Benutzerkontrolle und Freiheit',
  'Konsistenz und Standards',
  'Fehlervermeidung',
  'Wiedererkennung statt Erinnerung',
  'Flexibilität und Effizienz der Nutzung',
  'Ästhetisches und minimalistisches Design',
  'Hilfe bei der Erkennung, Diagnose und Behebung von Fehlern',
  'Hilfe und Dokumentation'
]

export const isoStandards = [
  'Effektivität',
  'Effizienz', 
  'Zufriedenheit',
  'Erlernbarkeit',
  'Bedienbarkeit',
  'Barrierefreiheit'
]
