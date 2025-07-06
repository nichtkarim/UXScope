'use client'

import { BookOpen, Target, Users, Zap, BarChart3, CheckCircle, AlertTriangle } from 'lucide-react'

export default function MethodologyView() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Wissenschaftliche Methodik
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Diese Anwendung implementiert die wissenschaftliche Methodik zur LLM-basierten 
          Usability-Evaluation entsprechend der Bachelorarbeit-Spezifikation.
        </p>
      </div>

      {/* LLM Auswahl */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Auswahl der LLMs</h2>
        </div>
        
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Auswahlkriterien</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Öffentlich zugängliche APIs oder Open-Source-Verfügbarkeit</li>
            <li>• Fähigkeiten in Textanalyse, Bilderkennung (Multimodalität) und komplexer Problemlösung</li>
            <li>• Technische Umsetzbarkeit mit Flexibilität für Prompt-Engineering</li>
            <li>• Vergleichbarkeit zwischen proprietären und offenen Modellen</li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3 bg-background rounded-lg p-4 border">
            <h3 className="font-medium text-blue">GPT-4o / 4.5 (OpenAI)</h3>
            <p className="text-sm text-muted-foreground">
              Kommerzielles, multimodales Modell mit fortschrittlichen Text- und 
              Bildverarbeitungsfähigkeiten. Erwartet besonders gut für die Analyse 
              von Screenshots und Quellcode geeignet zu sein.
            </p>
            <div className="text-xs bg-blue-soft p-2 rounded border border-blue">
              <strong className="text-blue">Erwartung:</strong> <span className="text-foreground">Beste Performance durch Multimodalität und komplexe Zusammenhänge</span>
            </div>
          </div>
          
          <div className="space-y-3 bg-background rounded-lg p-4 border">
            <h3 className="font-medium text-green">Claude 4 (Anthropic)</h3>
            <p className="text-sm text-muted-foreground">
              Leistungsstarkes kommerzielles Modell mit Fähigkeit zur Verarbeitung 
              langer Kontexte und starke Leistung in komplexen Denkaufgaben. 
              Besonders nützlich für detaillierte App-Übersichten und Benutzeraufgaben.
            </p>
            <div className="text-xs bg-green-soft p-2 rounded border border-green">
              <strong className="text-green">Erwartung:</strong> <span className="text-foreground">Beste Performance bei komplexen Analysen und langen Kontexten</span>
            </div>
          </div>
          
          <div className="space-y-3 bg-background rounded-lg p-4 border">
            <h3 className="font-medium text-orange">Llama 3 (Meta)</h3>
            <p className="text-sm text-muted-foreground">
              Führendes Open-Source-Modell. Ermöglicht Vergleich zwischen proprietären 
              und offenen Modellen und trägt zur Generierung neuer Erkenntnisse bei, 
              insbesondere zur Performance frei verfügbarer Modelle.
            </p>
            <div className="text-xs bg-orange-soft p-2 rounded border border-orange">
              <strong className="text-orange">Erwartung:</strong> <span className="text-foreground">Open-Source-Alternative mit vergleichbarer Performance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Engineering */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Prompt Engineering & Anpassung</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Persona-Instruktion</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Dem LLM wird explizit die Rolle eines &quot;UX-Experten für mobile Anwendungen&quot; zugewiesen,
              um domänenspezifische Sprache und Perspektive zu fördern und anwenderorientierte 
              Probleme zu identifizieren.
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
              &quot;Du bist ein erfahrener UX-Experte mit Spezialisierung auf mobile Anwendungen. 
              Analysiere die folgende App-Ansicht und identifiziere Usability-Probleme. 
              Formuliere deine Erkenntnisse klar und prägnant aus Nutzersicht.&quot;
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Strukturierte Eingabe</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Verwendung von XML-ähnlichen Tags zur klaren Trennung verschiedener 
              Informationskomponenten und Vermeidung von Mehrdeutigkeiten.
            </p>
            <div className="bg-muted p-3 rounded text-xs font-mono">
              &lt;app_context&gt;<br/>
              &lt;app_description&gt;...&lt;/app_description&gt;<br/>
              &lt;user_task&gt;...&lt;/user_task&gt;<br/>
              &lt;/app_context&gt;
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Offene Problemidentifikation</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Bewusst offen formulierte Aufgabenstellung ohne numerische Begrenzung,
              um Halluzinationen zu vermeiden und umfassende Analyseergebnisse zu fördern.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Kontextbezogene Eingaben</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Bereitgestellte Informationen:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• App-Übersicht (Zweck und Nutzungskontext)</li>
                  <li>• Benutzeraufgabe (spezifische Interaktionen)</li>
                  <li>• Screenshot der Ansicht (visuelle Grundlage)</li>
                  <li>• SwiftUI-Quellcode (technische Details)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">One-Shot/Few-Shot Prompting:</h4>
                <p className="text-sm text-muted-foreground">
                  Optionale Beispiele zur Formatierung, bei explorativen Aufgaben 
                  zurückhaltend eingesetzt um Entdeckungsfreiheit zu bewahren.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Iterative Optimierung</h3>
            <p className="text-sm text-muted-foreground">
              Kontinuierliche Prompt-Verfeinerung basierend auf Ausgabequalität,
              um Genauigkeit und Relevanz der identifizierten Usability-Probleme zu steigern.
            </p>
          </div>
        </div>
      </div>

      {/* Evaluationsmetriken */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Evaluationsmetriken & Vergleich</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Übereinstimmungsanalysen (Precision/Recall)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Quantitative Bewertung der Genauigkeit und Vollständigkeit der LLM-Identifikation
              durch direkten Vergleich mit der Ground Truth.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Precision (Genauigkeit)</h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <div className="font-mono text-sm mb-2 text-blue-800 dark:text-blue-200">Precision = TP / (TP + FP)</div>
                  <p className="text-xs text-muted-foreground">
                    Anteil der vom LLM identifizierten Probleme, die tatsächlich korrekt sind.
                    Eine hohe Precision bedeutet wenige falsche Alarme.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Recall (Vollständigkeit)</h4>
                <div className="bg-green-soft p-3 rounded border border-green">
                  <div className="font-mono text-sm mb-2">Recall = TP / (TP + FN)</div>
                  <p className="text-xs text-muted-foreground">
                    Anteil der in der Ground Truth vorhandenen Probleme, die vom LLM 
                    korrekt identifiziert wurden.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-warning-soft rounded border border-warning">
              <p className="text-sm text-muted-foreground">
                <strong>Hinweis:</strong> Precision wird als Hauptindikator verwendet, da die 
                vollständige Menge aller Usability-Probleme schwer bestimmbar ist.
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Qualitative Analyse der Problemtypen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Analysebereiche:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Vergleich der Detaillierung (breit vs. granular)</li>
                  <li>• Einzigartige Beiträge der LLMs</li>
                  <li>• Übersehene Probleme</li>
                  <li>• Kontextübergreifende Probleme</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Fehlertypen (False Positives):</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• No Usability Issue (objektiv kein Problem)</li>
                  <li>• Uncertain (zu vage oder spekulativ)</li>
                  <li>• Irrelevant/Incorrect Statement</li>
                  <li>• Duplicate (mehrfach identifiziert)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Limitationen */}
      <div className="bg-warning-soft rounded-lg p-6 border border-warning">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h2 className="text-xl font-semibold text-warning">
            Validierung der Limitationen
          </h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2 text-warning">
              Validierung der &quot;Ground Truth&quot;
            </h3>
            <p className="text-sm text-muted-foreground">
              Systematische Anwendung des Human-Centered Design (HCD) Modells nach 
              ISO 9241-210 und etablierte Usability-Heuristiken gewährleisten die Robustheit.
              Subjektivität wird durch detaillierte Dokumentation minimiert.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 text-warning">
              Allgemeine Limitationen
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Beschränkung auf wenige Anwendungen - limitierte Generalisierbarkeit</li>
              <li>• Modellabhängige Erkenntnisse - spezifisch für ausgewählte LLMs</li>
              <li>• Subjektive Usability-Evaluation - inhärent subjektiver Prozess</li>
              <li>• LLM-Nicht-Determinismus - Variationen bei identischen Prompts</li>
              <li>• Fokus auf Problemidentifikation - keine Lösungsentwicklung</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Wissenschaftliche Einordnung */}
      <div className="bg-success-soft rounded-lg p-6 border border-success">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-success" />
          <h2 className="text-xl font-semibold text-success">
            Wissenschaftliche Einordnung
          </h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2 text-success">
              Methodische Fundierung
            </h3>
            <p className="text-sm text-muted-foreground">
              Die Studie basiert auf etablierten Standards (ISO 9241-210, Nielsen-Heuristiken) 
              und wendet systematische Evaluationsmethoden an, um wissenschaftliche Rigorosität 
              zu gewährleisten.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 text-success">
              Reproduzierbarkeit
            </h3>
            <p className="text-sm text-muted-foreground">
              Detaillierte Dokumentation des Prompt Engineering und der Evaluationsmethodik 
              ermöglicht die Replikation der Studie mit anderen Anwendungen oder LLMs.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 text-success">
              Beitrag zur Forschung
            </h3>
            <p className="text-sm text-muted-foreground">
              Vergleich zwischen proprietären und Open-Source-Modellen generiert neue 
              Erkenntnisse zur Performance verschiedener LLM-Typen in der Usability-Bewertung.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
