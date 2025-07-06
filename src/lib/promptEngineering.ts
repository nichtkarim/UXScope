import { AppContext } from '@/types'

/**
 * Prompt Engineering für LLM-basierte Usability-Analyse
 * Basiert auf wissenschaftlicher Methodik der Bachelorarbeit
 * 
 * Diese Implementierung integriert Erkenntnisse aus der UX-LLM Studie (IEEE Xplore: 11029918)
 * und ermöglicht A/B Testing zwischen verschiedenen Prompt-Ansätzen.
 */

/**
 * Type für die verfügbaren Prompt-Varianten
 */
export type PromptVariant = 'pure' | 'extended';

export class PromptEngineer {
  /**
   * A/B Testing Konfiguration für Prompt-Varianten
   * 
   * FORSCHUNGS-HINWEIS:
   * Diese Implementierung ermöglicht das Testen zweier wissenschaftlich fundierter Prompt-Ansätze:
   * 
   * 1. "PURE" - Minimalistischer Ansatz basierend auf UX-LLM Studie (IEEE Xplore: 11029918)
   *    - Kurze, prägnante Instruktionen
   *    - Fokus auf offene Problemidentifikation
   *    - Keine detaillierten Kategorien oder Frameworks
   *    - Direkter Transfer aus der veröffentlichten IEEE-Studie
   * 
   * 2. "EXTENDED" - Erweiterte Variante für Thesis-Level Analyse
   *    - Detaillierte Expertise-Beschreibung
   *    - Strukturierte Problemkategorien
   *    - Wissenschaftliche Analysemethodik
   *    - Umfassende Qualitätskriterien
   * 
   * Verwendung für A/B Testing:
   * - Verwende 'PURE' für Vergleichbarkeit mit der UX-LLM Studie
   * - Verwende 'EXTENDED' für detailliertere wissenschaftliche Analyse
   * - Dokumentiere Ergebnisse beider Varianten für empirische Auswertung
   */
  static readonly PROMPT_VARIANTS = {
    PURE: 'pure',      // Minimalistisch, studienbasiert
    EXTENDED: 'extended' // Erweitert, thesis-level
  } as const;

  /**
   * Erstellt einen strukturierten Prompt für die Usability-Analyse
   * mit Persona-Instruktion und klarer Inputgestaltung
   * 
   * @param appContext - App-Kontext für die Analyse
   * @param includeExamples - Ob Beispiele inkludiert werden sollen
   * @param customPrompt - Benutzerdefinierte Zusatzanweisungen
   * @param variant - Prompt-Variante für A/B Testing ('pure' oder 'extended')
   */
  static createUsabilityPrompt(
    appContext: AppContext, 
    includeExamples: boolean = false, 
    customPrompt?: string,
    variant: PromptVariant = 'extended'
  ): string {
    console.log('🔍 PromptEngineer Debug - Creating prompt with variant:', variant)
    
    // Auswahl der Prompt-Variante basierend auf Parameter
    const systemPrompt = variant === 'pure' 
      ? this.getPureSystemPrompt()
      : this.getExtendedSystemPrompt()
    
    const structuredInput = this.formatStructuredInput(appContext)
    const examples = includeExamples ? this.getExamples() : ''
    const instructions = variant === 'pure'
      ? this.getPureInstructions()
      : this.getExtendedInstructions()
    
    console.log('🔍 PromptEngineer Debug - Selected system prompt type:', variant === 'pure' ? 'PURE' : 'EXTENDED')
    console.log('🔍 PromptEngineer Debug - System prompt length:', systemPrompt.length)
    console.log('🔍 PromptEngineer Debug - Instructions length:', instructions.length)
    
    // Benutzerdefinierte Prompt einbinden, falls vorhanden
    const customInstructions = customPrompt ? this.formatCustomPrompt(customPrompt) : ''
    
    const finalPrompt = `${systemPrompt}

${examples}

${structuredInput}

${instructions}

${customInstructions}`

    console.log('🔍 PromptEngineer Debug - Final prompt length:', finalPrompt.length)
    console.log('🔍 PromptEngineer Debug - Final prompt preview (first 200 chars):', finalPrompt.substring(0, 200) + '...')
    
    return finalPrompt
  }

  /**
   * Formatiert die benutzerdefinierte Prompt
   */
  private static formatCustomPrompt(customPrompt: string): string {
    return `
<zusaetzliche_anforderungen>
Berücksichtige zusätzlich folgende spezifische Anforderungen des Benutzers:

${customPrompt}

Integriere diese Anforderungen in deine Analyse und gehe besonders auf diese Aspekte ein.
</zusaetzliche_anforderungen>`
  }

  /**
   * PURE System-Prompt basierend auf UX-LLM Studie (IEEE Xplore: 11029918)
   * Minimalistische Instruktionen für studienkonformen Ansatz (auf Deutsch)
   */
  private static getPureSystemPrompt(): string {
    return `Du bist ein UX-Experte für mobile Apps. Deine Aufgabe ist es, Usability-Probleme basierend auf den Informationen über eine App-Ansicht zu identifizieren. Ein Beispiel für ein Usability-Problem könnte sein: 'Fehlendes visuelles Feedback bei Nutzerinteraktionen'.

Antworte in der App-Domänen-Sprache; verwende keine technische Terminologie und erwähne keine Code-Details. Zähle die identifizierten Probleme auf; füge einen leeren Absatz nach jeder Aufzählung hinzu; keine einleitenden oder abschließenden Texte.`
  }

  /**
   * EXTENDED System-Prompt für detaillierte Thesis-Level Analyse
   * Umfassende Expertise-Beschreibung mit wissenschaftlicher Fundierung
   * Subtile Integration von Nielsen's Heuristiken und ISO-Standards als Bewertungskriterien
   */
  private static getExtendedSystemPrompt(): string {
    return `Du bist ein erfahrener UX-Experte mit spezialisierter Expertise in der mobilen App-Evaluation. Deine Aufgabe ist es, Usability-Probleme systematisch zu identifizieren und zu bewerten, basierend auf etablierten UX-Prinzipien und wissenschaftlichen Erkenntnissen.

## Deine Expertise umfasst:
• **Mobile Usability**: Spezialkenntnisse in iOS und Android Interface-Guidelines
• **Visuelle Hierarchie**: Analyse von Kontrasten, Typografie und Layout-Strukturen  
• **Interaktionsdesign**: Bewertung von Touch-Targets, Feedback-Mechanismen und Mikrointeraktionen
• **Barrierefreiheit**: WCAG 2.1 Compliance und assistive Technologien
• **Nutzerpsychologie**: Mentale Modelle, kognitive Belastung und Aufmerksamkeitsführung
• **Benutzerführung**: Analyse von Arbeitsabläufen, Lernbarkeit und Nutzerautonomie

## Analysemethodik (basierend auf UX-LLM Forschung):
**Fokussiere auf folgende bewährte Problemkategorien:**

### Visuelle und Wahrnehmungsprobleme:
- Kontrast-Probleme zwischen Text und Hintergrund
- Inkonsistente Farbschemata oder Theme-Behandlung
- Fehlende visuelle Hierarchie oder Informationsarchitektur
- Unleserliche oder zu kleine Schriftgrößen
- Problematische Icon-Verwendung ohne Beschriftung

### Interaktions- und Feedback-Probleme:
- Fehlendes visuelles Feedback bei Nutzerinteraktionen
- Unklare oder mehrdeutige Bedienelemente
- Zu kleine Touch-Targets (unter 44px)
- Inkonsistente Interaktionsmuster
- Fehlende oder verwirrende Loading-States

### Navigation und Orientierungsprobleme:
- Unklare Navigation oder Informationsarchitektur
- Fehlende Orientierungshilfen (Breadcrumbs, Progress-Indikatoren)
- Inkonsistente oder verwirrende Button-Beschriftungen
- Problematische Back-Button-Funktionalität
- Mehrdeutige oder versteckte Funktionen

### Inhalts- und Verständlichkeitsprobleme:
- Unklare oder fehlende Beschreibungen
- Inkonsistente Terminologie
- Fehlende Pflichtfeld-Kennzeichnung
- Informationsüberladung oder unstrukturierte Inhalte
- Fehlende Hilfestellungen oder Kontextinformationen

### Effizienz und Kontrolle:
- Umständliche oder ineffiziente Arbeitsabläufe
- Fehlende Shortcuts oder Abkürzungen für wiederkehrende Aufgaben
- Unzureichende Nutzerführung bei komplexen Prozessen
- Fehlende Undo-/Redo-Funktionalität
- Mangelnde Anpassungsmöglichkeiten an Nutzerpräferenzen

### Fehlerbehandlung und Prävention:
- Fehlende Eingabevalidierung oder unklare Fehlermeldungen
- Unzureichende Fehlerprävention bei kritischen Aktionen
- Fehlende Bestätigungsdialoge bei wichtigen Entscheidungen
- Schwer verständliche oder technische Fehlermeldungen
- Fehlende Wiederherstellungsmöglichkeiten nach Fehlern

### Konsistenz und Standards:
- Abweichungen von etablierten Plattform-Konventionen
- Inkonsistente Terminologie oder Beschriftungen
- Widersprüchliche Interaktionsmuster innerhalb der App
- Fehlende Übereinstimmung mit mentalen Modellen der Nutzer
- Abweichungen von branchenüblichen Standards

### Effizienz und Kontrolle:
- Umständliche oder ineffiziente Arbeitsabläufe
- Fehlende Shortcuts oder Abkürzungen für wiederkehrende Aufgaben
- Unzureichende Nutzerführung bei komplexen Prozessen
- Fehlende Undo-/Redo-Funktionalität
- Mangelnde Anpassungsmöglichkeiten an Nutzerpräferenzen

### Aufgabenunterstützung und Nutzerführung:
- Unnötige oder verwirrende Schritte in Arbeitsabläufen
- Fehlende Hilfestellungen bei unklaren Funktionen
- Unzureichende Orientierung über den aktuellen Status
- Schwer nachvollziehbare Systemreaktionen
- Fehlende Möglichkeit zur individuellen Anpassung

### Lernbarkeit und Verständlichkeit:
- Schwer erlernbare oder unlogische Bedienabläufe
- Fehlende Erklärungen oder Hilfestellungen für neue Nutzer
- Unerwartete Reaktionen des Systems auf Nutzereingaben
- Inkonsistente Verhaltensmuster zwischen ähnlichen Funktionen
- Fehlende Unterstützung beim Erlernen der App-Bedienung

### Fehlerbehandlung und Prävention:
- Fehlende Eingabevalidierung oder unklare Fehlermeldungen
- Unzureichende Fehlerprävention bei kritischen Aktionen
- Fehlende Bestätigungsdialoge bei wichtigen Entscheidungen
- Schwer verständliche oder technische Fehlermeldungen
- Fehlende Wiederherstellungsmöglichkeiten nach Fehlern

### Accessibility und Inklusion:
- Probleme für Nutzer mit Sehbehinderungen
- Fehlende alternative Texte oder Labels
- Problematische Farbkodierung als einzige Information
- Mangelnde Keyboard-Navigation Support
- Unzureichende Unterstützung für assistive Technologien

## Wichtige Analyse-Prinzipien:
- **Nutzerorientiert**: Beschreibe Probleme aus Sicht echter Nutzer, nicht aus technischer Sicht
- **Konkret und spezifisch**: Referenziere spezifische UI-Elemente und deren Probleme
- **Kontextbezogen**: Berücksichtige verschiedene Nutzungsszenarien und Nutzergruppen
- **Evidenzbasiert**: Begründe jedes Problem mit nachvollziehbaren Auswirkungen
- **Lösungsorientiert**: Impliziere praktische Verbesserungsmöglichkeiten

## Ausgabeformat:
Strukturiere deine Analyse klar und prägnant:
1. Identifiziere Probleme ohne Nummerierung oder Bulletpoints
2. Beschreibe jedes Problem in einem eigenständigen Absatz
3. Verwende klare, verständliche Sprache ohne Fachbegriffe
4. Füge nach jedem Problem eine Leerzeile ein
5. Vermeide einleitende oder abschließende Texte

Fokussiere auf die wichtigsten und wirkungsvollsten Usability-Probleme, die echte Nutzer in realen Situationen beeinträchtigen würden.`
  }

  /**
   * PURE Instructions basierend auf UX-LLM Studie (IEEE Xplore: 11029918)
   * Minimale, offene Problemidentifikation ohne strukturelle Zwänge (auf Deutsch)
   * 
   * ULTRA-PURE VERSION: Entfernt sogar die Kategorisierungstags für maximale Studienkonformität
   */
  private static getPureInstructions(): string {
    return `Analysiere die bereitgestellte App-Ansicht und identifiziere Usability-Probleme. Konzentriere dich auf Probleme, die echte Nutzer in tatsächlichen Nutzungsszenarien beeinträchtigen würden.

Beschreibe jedes Problem in einem separaten Absatz mit einer Leerzeile zwischen den Problemen. Verwende domänenspezifische Sprache und vermeide technische Terminologie.`
  }

  /**
   * PURE Instructions mit Kategorisierung (für bessere UI-Integration)
   * Behält die Studienkonformität bei, fügt aber Kategorien für UI-Darstellung hinzu
   */
  private static getPureInstructionsWithCategories(): string {
    return `Analysiere die bereitgestellte App-Ansicht und identifiziere Usability-Probleme. Konzentriere dich auf Probleme, die echte Nutzer in tatsächlichen Nutzungsszenarien beeinträchtigen würden.

WICHTIG: Beginne jeden Befund mit einer Bewertung in eckigen Klammern:
- **[KATASTROPHAL]** für schwerwiegende Probleme
- **[KRITISCH]** für schwere Probleme  
- **[ERNST]** für erhebliche Probleme
- **[GERING]** für kleinere Probleme
- **[POSITIV]** für positive Aspekte

Beschreibe jedes Problem in einem separaten Absatz mit einer Leerzeile zwischen den Problemen. Verwende domänenspezifische Sprache und vermeide technische Terminologie.`
  }

  /**
   * EXTENDED Instructions für detaillierte wissenschaftliche Analyse
   * Umfassende Anweisungen für systematische Problemidentifikation
   */
  private static getExtendedInstructions(): string {
    return `<instructions>
Analysiere die bereitgestellte App-Ansicht und identifiziere Usability-Probleme basierend auf der App-Domäne und Nutzerperspektive.

## Strukturierte Eingabe-Analyse:
Du erhältst folgende Informationen:
- **App-Beschreibung**: Kontext und Zweck der Anwendung
- **Benutzeraufgabe**: Hauptziel der Interaktion mit dieser Ansicht  
- **Ansichtsname**: Bezeichnung der aktuellen Bildschirmansicht
- **Quellcode**: SwiftUI/React-Code/Anderer Code der Ansicht (falls verfügbar)
- **Screenshot**: Visueller Zustand der Anwendung

## Analysefokus (basierend auf UX-LLM Forschung):
Konzentriere dich auf Probleme, die **echte Nutzer in realen Situationen** beeinträchtigen:

### Visuelle Wahrnehmung:
- Farbkontraste und Lesbarkeit bei verschiedenen Lichtverhältnissen
- Schriftgrößen und deren Skalierbarkeit  
- Visuelle Hierarchie und Informationsarchitektur
- Icon-Verständlichkeit ohne Textlabels

### Interaktion und Feedback:
- Visuelles Feedback bei Benutzerinteraktionen
- Touch-Target-Größen (minimum 44px für mobile Geräte)
- Loading-States und Wartezeiten-Indikatoren
- Eindeutigkeit von Bedienelementen

### Navigation und Orientierung:
- Klarheit der Navigationsstruktur
- Orientierungshilfen und Fortschrittsanzeigen
- Back-Button-Funktionalität und -beschriftung
- Auffindbarkeit versteckter Funktionen

### Inhalte und Verständlichkeit:
- Klarheit von Beschreibungen und Labels
- Konsistenz in Terminologie und Bezeichnungen
- Kennzeichnung von Pflichtfeldern
- Verständlichkeit von Fehlermeldungen

### Barrierefreiheit:
- Unterstützung für Nutzer mit Sehbehinderungen
- Alternative Texte und Labels für Screen Reader
- Keyboard-Navigation und assistive Technologien
- Farbkodierung als einzige Informationsquelle

### Arbeitsabläufe und Nutzerführung:
- Sind alle Schritte zur Aufgabenerledigung klar und logisch?
- Verstehen Nutzer intuitiv, was sie als nächstes tun sollen?
- Können Nutzer ihre Eingaben kontrollieren und korrigieren?
- Reagiert die App so, wie Nutzer es erwarten würden?
- Werden Nutzer bei Fehlern angemessen unterstützt?
- Können erfahrene Nutzer die App an ihre Bedürfnisse anpassen?
- Ist die App auch für neue Nutzer leicht erlernbar?

## Ausgabeformat (strikt befolgen):
- **Keine einleitende oder abschließende Texte**
- **Jedes Problem in einem eigenständigen Absatz**
- **Eine Leerzeile nach jedem Problem**
- **Nutzerorientierte Sprache ohne Fachbegriffe**
- **Keine Nummerierung oder Bulletpoints**
- **Keine Code-Details oder technische Terminologie erwähnen**

## WICHTIG: Kategorisierung der Befunde
Jeder Befund MUSS mit einer der folgenden Bewertungen beginnen:

**[KATASTROPHAL]** - Für schwerwiegende Probleme, die die App unbrauchbar machen oder wichtige Aufgaben komplett blockieren oder gefahr für Leben sind und eine größerer Schaden entstehen kann
**[KRITISCH]** - Für schwere Probleme, die die Nutzerfreundlichkeit stark beeinträchtigen
**[ERNST]** - Für erhebliche Probleme, die die Nutzererfahrung spürbar verschlechtern
**[GERING]** - Für kleinere Probleme, die nur geringfügige Auswirkungen haben
**[POSITIV]** - Für positive Aspekte und Stärken der Benutzeroberfläche

Beispiel für korrektes Format:
**[KRITISCH]** Fehlende Interaktionshinweise machen es für Nutzer schwierig zu verstehen, welche Elemente anklickbar sind.

**[POSITIV]** Die Farbgebung ist konsistent und unterstützt eine klare visuelle Hierarchie.

**[ERNST]** Zu kleine Schriftgrößen können die Lesbarkeit bei schlechten Lichtverhältnissen beeinträchtigen.

## Qualitätskriterien:
- **Spezifisch**: Referenziere konkrete UI-Elemente
- **Nachvollziehbar**: Erkläre die Auswirkung auf Nutzer
- **Kontextbezogen**: Berücksichtige verschiedene Nutzungsszenarien
- **Realistisch**: Fokussiere auf tatsächlich vorhandene Probleme
- **Nutzerorientiert**: Beschreibe aus echter Nutzerperspektive

## Anti-Halluzination-Prinzipien:
- Identifiziere nur Probleme, die im bereitgestellten Material erkennbar sind
- Spekuliere nicht über nicht sichtbare Funktionen
- Vermeide technische Implementierungsdetails
- Fokussiere auf direkt beobachtbare Usability-Aspekte

Führe eine offene, explorative Problemidentifikation durch ohne Begrenzung der Anzahl der Probleme. Lass dich von der bereitgestellten Eingabe leiten und identifiziere die wichtigsten Usability-Herausforderungen für echte Nutzer.
</instructions>`
  }

  /**
   * Strukturierte Eingabe mit XML-ähnlichen Tags
   * Basiert auf UX-LLM Studie: "Use delimiters to clearly indicate distinct parts of the input"
   * Trennt verschiedene Informationskomponenten klar voneinander für bessere LLM-Verarbeitung
   */
  private static formatStructuredInput(appContext: AppContext): string {
    return `<app_context>
<app_overview>
${appContext.appDescription}
</app_overview>

<user_task>
${appContext.userTask}
</user_task>

<view_name>
${appContext.viewName}
</view_name>

${appContext.sourceCode ? `<source_code>
${appContext.sourceCode}
</source_code>` : ''}
</app_context>

<image>
[The provided image shows the current state of the application]
</image>`
  }

  /**
   * Nutzerorientierte Beispiele für freie Problemidentifikation
   * Basiert auf UX-LLM Studie: Offene Problemidentifikation ohne strukturelle Zwänge
   * Nutzt One-Shot Prompting mit konkreten Beispielen aus der wissenschaftlichen Forschung
   */
  private static getExamples(): string {
    return `<examples>
**Beispiel eines validen Usability-Problems (basierend auf UX-LLM Forschung):**

"Insufficient contrast between text and background color: The yellow background with white text on the category buttons may not provide enough contrast for users with visual impairments or when viewing in bright light conditions."

**Beispiel eines Interaktionsproblems:**

"No visual feedback on button press: The category buttons do not appear to have any visual feedback when tapped, which could leave users uncertain whether their input has been registered."

**Beispiel eines Navigationsproblems:**

"Lack of clear navigation cues: There is no clear indication of how to proceed to the next question after a selection is made, which could lead to user confusion."

**Beispiel eines Barrierefreiheitsproblems:**

"Inadequate touch targets: The button may have an inadequate touch target size, which could make it difficult for users to tap accurately, especially on devices with smaller screens."

**Beispiel eines Verständlichkeitsproblems:**

"Ambiguous progress bar: The progress bar does not have a label or any indication of what it represents, which could lead to confusion about the user's progress."
</examples>`
  }

  /**
   * Erstellt einen spezifischen Prompt für die iterative Optimierung
   * Verwendet bei der Prompt-Verfeinerung während der Datengenerierung
   * Kritischer Schritt im Prompt Engineering zur kontinuierlichen Verbesserung
   */
  static createRefinedPrompt(appContext: AppContext, previousIssues: string[]): string {
    const basePrompt = this.createUsabilityPrompt(appContext, false)
    const refinements = this.getRefinements(previousIssues)
    
    return `${basePrompt}

${refinements}`
  }

  /**
   * Verfeinerungen basierend auf vorherigen Iterationen
   * Systematische Anpassungen um Qualität der LLM-Ausgaben zu steigern
   */
  private static getRefinements(previousIssues: string[]): string {
    return `<refinements>
Berücksichtige folgende Punkte aus vorherigen Analysen:
${previousIssues.map(issue => `- ${issue}`).join('\n')}

Vermeide häufige Probleme:
- Wiederholung bereits genannter Probleme
- Zu allgemeine oder vage Aussagen ("schlechte Navigation")
- Spekulative Probleme ohne klare Evidenz
- Technische Details, die nicht nutzerzentriert sind
- Irrelevante Informationen außerhalb der Usability-Bewertung
- Halluzinationen von nicht vorhandenen UI-Elementen

Fokussiere stattdessen auf:
- Spezifische, nachvollziehbare Probleme
- Direkte Auswirkungen auf die Benutzererfahrung
- Konkrete Verbesserungsvorschläge
</refinements>`
  }

  /**
   * A/B Testing Utility für einfache Prompt-Varianten-Auswahl
   * Bietet eine einfache Schnittstelle für das Testen beider Varianten
   * 
   * @param appContext - App-Kontext für die Analyse
   * @param testPure - Wenn true, wird die PURE Variante verwendet, sonst EXTENDED
   * @param includeExamples - Ob Beispiele inkludiert werden sollen
   * @param customPrompt - Optionale benutzerdefinierte Zusatzanweisungen
   * @returns Strukturierter Prompt für die gewählte Variante
   */
  static createABTestPrompt(
    appContext: AppContext,
    testPure: boolean = false,
    includeExamples: boolean = false,
    customPrompt?: string
  ): string {
    const variant: PromptVariant = testPure ? 'pure' : 'extended'
    
    return this.createUsabilityPrompt(appContext, includeExamples, customPrompt, variant)
  }

  /**
   * Erstellt beide Prompt-Varianten für direkten Vergleich
   * Nützlich für die wissenschaftliche Auswertung und Dokumentation
   * 
   * @param appContext - App-Kontext für die Analyse
   * @param includeExamples - Ob Beispiele inkludiert werden sollen
   * @param customPrompt - Optionale benutzerdefinierte Zusatzanweisungen
   * @returns Objekt mit beiden Prompt-Varianten
   */
  static createBothVariants(
    appContext: AppContext,
    includeExamples: boolean = false,
    customPrompt?: string
  ): { pure: string; extended: string } {
    return {
      pure: this.createUsabilityPrompt(appContext, includeExamples, customPrompt, 'pure'),
      extended: this.createUsabilityPrompt(appContext, includeExamples, customPrompt, 'extended')
    }
  }
}

/**
 * Prompt-Varianten für verschiedene LLM-Modelle
 * Ermöglicht modellspezifische Optimierungen basierend auf Stärken der LLMs
 */
export const ModelSpecificPrompts = {
  'gpt4o': {
    systemRole: 'Als multimodaler UX-Experte mit Fokus auf visueller Analyse, nutze deine Fähigkeiten zur detaillierten Bild- und Textanalyse für eine umfassende Usability-Bewertung. Analysiere sowohl die visuellen Elemente als auch die strukturellen Aspekte der Benutzeroberfläche.',
    focusAreas: ['Visuelle Hierarchie', 'Interaktionsdesign', 'Multimodale Konsistenz', 'Ästhetische Bewertung', 'Informationsarchitektur'],
    additionalInstructions: 'Nutze deine visuellen Analysefähigkeiten, um detaillierte Bewertungen zu Farben, Typografie, Layoutstrukturen und visuellen Affordanzen zu geben.'
  },
  
  'claude4': {
    systemRole: 'Als UX-Experte mit Fokus auf analytische Tiefe und längere Kontexte, nutze deine Fähigkeit zur Verarbeitung komplexer Informationen für eine strukturierte, wissenschaftlich fundierte Analyse mit ausführlichen Begründungen.',
    focusAreas: ['Nutzerflow-Analyse', 'Kognitive Belastung', 'Konsistenz-Prüfung', 'Detaillierte Heuristik-Bewertung', 'Kontextübergreifende Probleme', 'Wissenschaftliche Fundierung'],
    additionalInstructions: 'Führe eine tiefgehende Analyse durch mit ausführlichen Begründungen, wissenschaftlichen Referenzen und detaillierten Bewertungen jeder Nielsen-Heuristik.'
  },
  
  'llama3': {
    systemRole: 'Als UX-Experte mit Fokus auf praktische und direkte Problembenennung, analysiere aus nutzerorientierter Sicht mit klaren, umsetzbaren Empfehlungen. Konzentriere dich auf die wichtigsten Usability-Aspekte.',
    focusAreas: ['Grundlegende Usability-Prinzipien', 'Klare Problemidentifikation', 'Zugänglichkeit', 'Nutzerfreundlichkeit', 'Praktische Lösungen'],
    additionalInstructions: 'Konzentriere dich auf die wichtigsten Usability-Probleme mit klaren, praktischen Lösungsvorschlägen. Vermeide übermäßig technische Terminologie.'
  }
}

/**
 * Qualitätskontrolle für LLM-Antworten
 * Prüft die Antwort auf typische Probleme
 */
export class ResponseValidator {
  static validateResponse(response: string): {
    isValid: boolean
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []
    
    // Prüfe auf zu kurze Antworten
    if (response.length < 200) {
      issues.push('Antwort zu kurz - möglicherweise unvollständig')
      suggestions.push('Prompt erweitern oder spezifischere Anweisungen geben')
    }
    
    // Prüfe auf wiederholte Phrasen (mögliche Halluzination)
    const words = response.split(' ')
    const repeatedPhrases = this.findRepeatedPhrases(words)
    if (repeatedPhrases.length > 0) {
      issues.push('Wiederholte Phrasen entdeckt')
      suggestions.push('Prompt zur Vermeidung von Wiederholungen anpassen')
    }
    
    // Prüfe auf Struktur
    if (!response.includes('##') && !response.includes('**')) {
      issues.push('Fehlende Strukturierung der Antwort')
      suggestions.push('Klarere Formatierungsanweisungen im Prompt')
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    }
  }
  
  private static findRepeatedPhrases(words: string[]): string[] {
    // Vereinfachte Implementierung - kann erweitert werden
    const phrases = new Map<string, number>()
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = words.slice(i, i + 3).join(' ')
      phrases.set(phrase, (phrases.get(phrase) || 0) + 1)
    }
    
    return Array.from(phrases.entries())
      .filter(([_, count]) => count > 1)
      .map(([phrase, _]) => phrase)
  }
}
