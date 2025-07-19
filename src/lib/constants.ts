import { LLMModel } from '@/types'

/**
 * Ausgewählte LLMs für die Bachelorarbeit
 * 
 * Auswahlkriterien:
 * - Öffentlich zugängliche APIs oder Open-Source-Verfügbarkeit
 * - Fähigkeiten in Textanalyse, Bilderkennung (Multimodalität) und komplexer Problemlösung
 * - Technische Umsetzbarkeit mit Flexibilität für Prompt-Engineering
 */
export const llmModels: LLMModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Kommerzielles, multimodales Modell von OpenAI mit fortschrittlichen Text- und Bildverarbeitungsfähigkeiten. Erwartet besonders gut für die Analyse von Screenshots und Quellcode geeignet zu sein, aufgrund seiner Multimodalität und Fähigkeit komplexe Zusammenhänge zu verstehen.',
    supportVision: true
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Kompakte Version von GPT-4o mit ähnlichen Fähigkeiten aber schnellerer Verarbeitung.',
    supportVision: true
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Leistungsstarkes kommerzielles Modell von Anthropic, bekannt für die Verarbeitung langer Kontexte und starke Leistung in komplexen Denkaufgaben. Erwartet besonders nützlich für die Analyse von detaillierten App-Übersichten und Benutzeraufgaben zu sein.',
    supportVision: true
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Schnelle Version von Claude 3 für effiziente Verarbeitung.',
    supportVision: true
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    description: 'Führendes Open-Source-Modell von Meta über Together AI. Ermöglicht Vergleich zwischen proprietären und offenen Modellen und trägt zur Generierung neuer Erkenntnisse bei, insbesondere hinsichtlich der Performance frei verfügbarer Modelle in der Usability-Bewertung.',
    supportVision: false
  },
  {
    id: 'llama-3.1-local',
    name: 'Llama 3.1 (Local)',
    description: 'Lokale Installation von Llama 3.1 über Ollama. Ermöglicht vollständige Kontrolle und Datenschutz.',
    supportVision: false
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

/**
 * ISO 9241-210 Human-Centered Design Standards
 * Verwendet als Referenz für die Ground Truth Erstellung
 */
export const isoStandards = [
  'Effektivität',
  'Effizienz', 
  'Zufriedenheit',
  'Erlernbarkeit',
  'Bedienbarkeit',
  'Barrierefreiheit'
]

/**
 * Evaluationsmetriken für quantitative Analyse
 * Basiert auf Precision/Recall-Bewertung mit Ground Truth
 */
export const evaluationMetrics = [
  'Precision (Genauigkeit) = TP/(TP+FP)',
  'Recall (Vollständigkeit) = TP/(TP+FN)', 
  'True Positives (TP) - Korrekt erkannte Probleme',
  'False Positives (FP) - Fälschlicherweise erkannte Probleme',
  'False Negatives (FN) - Übersehene Probleme'
]

/**
 * Qualitative Fehlertypen für die Analyse der False Positives
 * Kategorisierung zur Verstehen der LLM-Fehlerarten
 */
export const errorTypes = [
  'No Usability Issue - Objektiv kein Problem',
  'Uncertain - Zu vage oder spekulativ',
  'Irrelevant/Incorrect Statement - Nicht zutreffend oder faktisch falsch',
  'Duplicate - Selbes Problem mehrfach identifiziert'
]

/**
 * Prompt Engineering Strategien
 * Zentrale Techniken für die LLM-Optimierung mit drei Varianten
 */
export const promptStrategies = [
  'A: STUDY-PURE - Originalgetreue IEEE-Studie "Does GenAI Make Usability Testing Obsolete?"',
  'B: BASIC - Deutsche Adaptation minimalistischer UX-LLM Ansatz (IEEE Xplore: 11029918)', 
  'C: ADVANCED - Thesis-Level Analyse mit detaillierter Expertise-Beschreibung',
  'Persona-Instruktion - Rollenzuweisung als UX-Experte',
  'Strukturierte Eingabe - XML-ähnliche Tags zur Trennung vs. Originalformat',
  'Offene Problemidentifikation - Keine numerische Begrenzung',
  'Kontextbezogene Eingaben - App-Übersicht, Benutzeraufgabe, Screenshots',
  'One-Shot/Few-Shot Prompting - Optionale Beispiele',
  'Iterative Optimierung - Kontinuierliche Prompt-Verfeinerung'
]

/**
 * Wissenschaftliche Limitationen
 * Erkannte Einschränkungen der Methodik
 */
export const limitations = [
  'Beschränkung auf wenige Anwendungen - Limitierte Generalisierbarkeit',
  'Modellabhängige Erkenntnisse - Spezifisch für ausgewählte LLMs',
  'Subjektive Ground Truth - Inhärent subjektiver Evaluationsprozess',
  'LLM-Nicht-Determinismus - Variationen bei identischen Prompts',
  'Fokus auf Problemidentifikation - Keine Lösungsentwicklung'
]
