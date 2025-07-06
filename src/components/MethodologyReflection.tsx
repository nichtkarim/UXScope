'use client'

import { useState } from 'react'
import { 
  AlertTriangle, 
  Brain, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Info,
  Lightbulb,
  Scale,
  TrendingUp
} from 'lucide-react'

export default function MethodologyReflection() {
  const [activeTab, setActiveTab] = useState<'problems' | 'alternative' | 'implementation'>('problems')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Kritische Reflexion der Methodik
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
          Diese Sektion reflektiert kritisch die Anwendung von Precision/Recall-Metriken für 
          Usability-Evaluation und stellt eine wissenschaftlich fundiertere Alternative vor.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 justify-center border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('problems')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'problems'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Probleme der Precision/Recall-Metriken
        </button>
        <button
          onClick={() => setActiveTab('alternative')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'alternative'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Alternative Methodik
        </button>
        <button
          onClick={() => setActiveTab('implementation')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'implementation'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Implementierung
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'problems' && <ProblemsWithPrecisionRecall />}
        {activeTab === 'alternative' && <AlternativeMethodology />}
        {activeTab === 'implementation' && <ImplementationDetails />}
      </div>
    </div>
  )
}

// Component: Problems with Precision/Recall
function ProblemsWithPrecisionRecall() {
  return (
    <div className="space-y-6">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
              Warum Precision/Recall für Usability-Evaluation ungeeignet sind
            </h2>
            <p className="text-red-700 dark:text-red-300">
              Die klassischen Metriken Precision und Recall wurden für binäre Klassifikationsaufgaben 
              entwickelt und sind für die komplexe, subjektive Bewertung von Usability-Problemen 
              wissenschaftlich nicht angemessen.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Problem 1: Binäre Vereinfachung
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>• Usability-Probleme sind nicht einfach "vorhanden" oder "nicht vorhanden"</li>
            <li>• Verschiedene Schweregrade und Kontextabhängigkeit</li>
            <li>• Subjektive Bewertung durch verschiedene Evaluatoren</li>
            <li>• Precision/Recall reduzieren diese Komplexität unzulässig</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Problem 2: Fehlende Ground Truth
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>• Kein objektiver "Goldstandard" für Usability-Probleme</li>
            <li>• Verschiedene Experten identifizieren unterschiedliche Probleme</li>
            <li>• Precision/Recall benötigen aber eine definitive Referenz</li>
            <li>• Führt zu künstlichen und wissenschaftlich fragwürdigen Bewertungen</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Problem 3: Kontextignoranz
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>• Precision/Recall berücksichtigen nicht die Qualität der Bewertung</li>
            <li>• Oberflächliche vs. tiefgreifende Analyse wird nicht unterschieden</li>
            <li>• Kontext und Begründung der Probleme werden ignoriert</li>
            <li>• Quantität wird über Qualität gestellt</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Problem 4: Wissenschaftliche Validität
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>• Metriken wurden nie für Usability-Evaluation validiert</li>
            <li>• Keine theoretische Fundierung für diese Anwendung</li>
            <li>• Führt zu Scheingenauigkeit ohne wissenschaftlichen Wert</li>
            <li>• Behindern echte methodische Innovation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Component: Alternative Methodology
function AlternativeMethodology() {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
              Qualitative Bewertungsmethodik
            </h2>
            <p className="text-green-700 dark:text-green-300">
              Unsere alternative Methodik fokussiert auf qualitative Dimensionen und 
              wissenschaftlich fundierte Bewertungskriterien, die der Komplexität von 
              Usability-Evaluation gerecht werden.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Analysekategorien
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>Spezifität:</strong> Wie konkret und umsetzbar sind die Empfehlungen?</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>Priorisierung:</strong> Werden kritische Probleme erkannt und gewichtet?</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>Kontext:</strong> Berücksichtigung der Zielgruppe und Nutzungsszenarien</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>Begründung:</strong> Qualität der Erklärungen und theoretischen Fundierung</span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Bewertungsdimensionen
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>Vollständigkeit:</strong> Abdeckung verschiedener Usability-Aspekte</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>Tiefe:</strong> Oberflächliche vs. tiefgreifende Analyse</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>Praktikabilität:</strong> Umsetzbarkeit der Empfehlungen</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>Innovation:</strong> Kreative und neue Lösungsansätze</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Wissenschaftliche Fundierung
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Diese Methodik orientiert sich an etablierten qualitativen Forschungsmethoden 
              und wurde speziell für die Bewertung von LLM-generierter Usability-Analyse entwickelt. 
              Sie berücksichtigt die Subjektivität und Kontextabhängigkeit von Usability-Bewertungen 
              und liefert dennoch systematische und vergleichbare Ergebnisse.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component: Implementation Details
function ImplementationDetails() {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <FileText className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-2">
              Technische Implementierung
            </h2>
            <p className="text-purple-700 dark:text-purple-300">
              Die alternative Bewertungsmethodik wurde vollständig in dieser Anwendung implementiert 
              und kann parallel zu den traditionellen Metriken verwendet werden.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Implementierte Komponenten
          </h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>AlternativeEvaluation.tsx:</strong> Hauptkomponente für qualitative Bewertung</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>alternativeEvaluation.ts:</strong> Bewertungslogik und Algorithmen</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>Kategorien-System:</strong> Strukturierte Fehlerkategorisierung</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>Visualisierung:</strong> Interaktive Darstellung der Ergebnisse</span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Methodische Vorteile
          </h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>Transparenz:</strong> Nachvollziehbare Bewertungskriterien</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>Flexibilität:</strong> Anpassbar an verschiedene Kontexte</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>Wissenschaftlichkeit:</strong> Methodisch fundierte Bewertung</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span><strong>Praxisrelevanz:</strong> Fokus auf umsetzbare Ergebnisse</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Zukunftsperspektiven
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-purple-800 dark:text-purple-200">
                Methodische Weiterentwicklung
              </h5>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Verfeinerung der Bewertungskriterien basierend auf empirischen Studien
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Scale className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-purple-800 dark:text-purple-200">
                Methodische Innovation
              </h5>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Entwicklung einer für Usability-Bewertung angemessenen Evaluationsmethodik
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-purple-800 dark:text-purple-200">
                Grundlage für weitere Forschung
              </h5>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Schafft Basis für zukünftige Studien zur LLM-basierten Usability-Analyse
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
