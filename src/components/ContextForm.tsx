'use client'

import { FileText, Code, Target, Brain } from 'lucide-react'
import { PromptVariant } from '@/lib/promptEngineering'

interface ContextData {
  description: string
  uiCode: string
  userTask: string
  customPrompt: string
  promptVariant: PromptVariant  // Verwendung des importierten Types
}

interface ContextFormProps {
  contextData: ContextData
  onContextChange: (data: ContextData) => void
}

export default function ContextForm({ contextData, onContextChange }: ContextFormProps) {
  const handleDescriptionChange = (value: string) => {
    onContextChange({
      ...contextData,
      description: value
    })
  }

  const handleCodeChange = (value: string) => {
    onContextChange({
      ...contextData,
      uiCode: value
    })
  }

  const handleUserTaskChange = (value: string) => {
    onContextChange({
      ...contextData,
      userTask: value
    })
  }

  const handleCustomPromptChange = (value: string) => {
    onContextChange({
      ...contextData,
      customPrompt: value
    })
  }

  const handlePromptVariantChange = (variant: PromptVariant) => {
    onContextChange({
      ...contextData,
      promptVariant: variant
    })
  }

  return (
    <div className="space-y-6">
      {/* Context Description */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            App-Übersicht *
          </label>
        </div>
        <textarea
          value={contextData.description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Beschreiben Sie den Zweck und Nutzungskontext der Anwendung..."
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          Beispiel: &quot;E-Commerce Mobile App für Elektronikprodukte, Zielgruppe: Tech-affine Nutzer 18-35 Jahre&quot;
        </p>
      </div>

      {/* User Task */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Benutzeraufgabe *
          </label>
        </div>
        <textarea
          value={contextData.userTask}
          onChange={(e) => handleUserTaskChange(e.target.value)}
          placeholder="Beschreiben Sie die spezifische Aufgabe, die der Nutzer in dieser Ansicht erfüllen soll..."
          className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          Beispiel: &quot;Produkt zur Wunschliste hinzufügen&quot; oder &quot;Checkout-Prozess abschließen&quot;
        </p>
      </div>

      {/* UI Code */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Quellcode (optional)
          </label>
        </div>
        <textarea
          value={contextData.uiCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="SwiftUI, HTML, React oder andere UI-Code-Fragmente der analysierten Oberfläche..."
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
        />
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          Ergänzende technische Informationen ermöglichen eine tiefere Analyse der Code-Struktur.
        </p>
      </div>

      {/* Custom Prompt */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Benutzerdefinierte Prompt (optional)
          </label>
        </div>
        <textarea
          value={contextData.customPrompt}
          onChange={(e) => handleCustomPromptChange(e.target.value)}
          placeholder="Erstellen Sie eine eigene Prompt für die LLM-Analyse... z.B. 'Fokussiere dich auf die Barrierefreiheit und mobile Nutzung'..."
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Ihre eigene Prompt wird mit der Standard-Usability-Analyse kombiniert.
          </p>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => handleCustomPromptChange("Fokussiere dich besonders auf die Barrierefreiheit und WCAG-Konformität dieser Anwendung.")}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Barrierefreiheit
            </button>
            <button
              type="button"
              onClick={() => handleCustomPromptChange("Analysiere die mobile Nutzbarkeit und Touch-Interaktionen dieser Anwendung.")}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Mobile UX
            </button>
            <button
              type="button"
              onClick={() => handleCustomPromptChange("Bewerte die visuelle Hierarchie, Typografie und das gesamte Design dieser Anwendung.")}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Design
            </button>
            <button
              type="button"
              onClick={() => handleCustomPromptChange("Analysiere die Ladezeiten, Performance und technische Aspekte dieser Anwendung.")}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Performance
            </button>
            <button
              type="button"
              onClick={() => handleCustomPromptChange("")}
              className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
            >
              Löschen
            </button>
          </div>
        </div>
      </div>

      {/* Prompt Variant Selection für A/B/C Testing */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-green-600 dark:text-green-400" />
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Prompt-Variante für A/B/C Testing
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* STUDY-PURE Variante (A) */}
          <div 
            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
              contextData.promptVariant === 'study-pure' 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-red-400'
            }`}
            onClick={() => handlePromptVariantChange('study-pure')}
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                name="promptVariant"
                value="study-pure"
                checked={contextData.promptVariant === 'study-pure'}
                onChange={() => handlePromptVariantChange('study-pure')}
                className="text-red-600 focus:ring-red-500"
              />
              <label className="font-medium text-gray-900 dark:text-white">
                STUDY-PURE (A)
              </label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Originalgetreue IEEE-Studie "Does GenAI Make Usability Testing Obsolete?"
            </p>
            <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
              <li>• Exakte Replikation der Originalstudie</li>
              <li>• Sprache via Toggle wählbar (DE/EN)</li>
              <li>• Direkte Vergleichbarkeit</li>
              <li>• Minimale Instruktionen</li>
            </ul>
          </div>

          {/* BASIC Variante (B) */}
          <div 
            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
              contextData.promptVariant === 'basic' 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-green-400'
            }`}
            onClick={() => handlePromptVariantChange('basic')}
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                name="promptVariant"
                value="basic"
                checked={contextData.promptVariant === 'basic'}
                onChange={() => handlePromptVariantChange('basic')}
                className="text-green-600 focus:ring-green-500"
              />
              <label className="font-medium text-gray-900 dark:text-white">
                BASIC (B)
              </label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Minimalistischer Ansatz mit grundlegenden Instruktionen
            </p>
            <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
              <li>• Kurze, prägnante Instruktionen</li>
              <li>• Offene Problemidentifikation</li>
              <li>• Sprache via Toggle wählbar (DE/EN)</li>
              <li>• Strukturierte XML-Eingabe</li>
            </ul>
          </div>

          {/* ADVANCED Variante (C) */}
          <div 
            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
              contextData.promptVariant === 'advanced' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400'
            }`}
            onClick={() => handlePromptVariantChange('advanced')}
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                name="promptVariant"
                value="advanced"
                checked={contextData.promptVariant === 'advanced'}
                onChange={() => handlePromptVariantChange('advanced')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <label className="font-medium text-gray-900 dark:text-white">
                ADVANCED (C)
              </label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Detaillierte Variante für umfassende wissenschaftliche Analyse
            </p>
            <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
              <li>• Strukturierte Problemkategorien</li>
              <li>• Wissenschaftliche Analysemethodik</li>
              <li>• Umfassende Qualitätskriterien</li>
              <li>• Nielsen-Heuristiken Integration</li>
              <li>• Sprache via Toggle wählbar (DE/EN)</li>
            </ul>
          </div>
        </div>
        <div className="mt-2 space-y-2">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-700 dark:text-yellow-300">
                <p className="font-medium mb-1">A/B/C Analysemethoden-Vergleich:</p>
                <p>Diese Einstellung ermöglicht den Vergleich zwischen drei wissenschaftlich fundierten Analysemethoden. 
                   Testen Sie alle Varianten mit identischen Eingaben, um die Unterschiede zu verstehen und empirische Daten für Ihre Forschung zu sammeln.</p>
              </div>
            </div>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Sprach-Toggle:</strong> Der Sprachschalter (DE/EN) in der Kopfzeile steuert die Sprache aller generierten Prompts. 
              Die Benutzeroberfläche bleibt auf Deutsch. Alle drei Varianten sind vollständig in beiden Sprachen verfügbar.
            </p>
          </div>
        </div>
      </div>

      {/* Guidelines Info - nur bei Advanced Variante anzeigen */}
      {contextData.promptVariant === 'advanced' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Bewertungskriterien</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">Nielsen's Heuristiken:</p>
              <ul className="space-y-1 text-xs">
                <li>• Systemstatus-Sichtbarkeit</li>
                <li>• System-Welt-Übereinstimmung</li>
                <li>• Benutzerkontrolle</li>
                <li>• Konsistenz & Standards</li>
                <li>• Fehlervermeidung</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">ISO-Standards:</p>
              <ul className="space-y-1 text-xs">
                <li>• Effektivität</li>
                <li>• Effizienz</li>
                <li>• Zufriedenheit</li>
                <li>• Barrierefreiheit (WCAG)</li>
                <li>• Erlernbarkeit</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">Dialogprinzipien:</p>
              <ul className="space-y-1 text-xs list-none">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Aufgabenangemessenheit</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Selbstbeschreibungsfähigkeit</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Steuerbarkeit</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Erwartungskonformität</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Fehlertoleranz</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
