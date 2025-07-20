import { AppContext } from '@/types'

/**
 * Prompt Engineering für LLM-basierte Usability-Analyse
 * Basiert auf wissenschaftlicher Methodik der Bachelorarbeit
 * 
 * Diese Implementierung integriert Erkenntnisse aus der UX-LLM Studie (IEEE Xplore: 11029918)
 * und ermöglicht A/B/C Testing zwischen verschiedenen Prompt-Ansätzen.
 */

/**
 * Type für die verfügbaren Prompt-Varianten
 */
export type PromptVariant = 'study-pure' | 'basic' | 'advanced';

export type UITechnologyMode = 'swiftui-only' | 'generalized'

export interface PromptConfig {
  variant: PromptVariant
  language: 'de' | 'en'
  uiMode: UITechnologyMode
  includeExamples: boolean
}

export class PromptEngineer {
  /**
   * A/B/C Testing Konfiguration für Prompt-Varianten mit UI-Technologie-Modi
   * 
   * FORSCHUNGS-HINWEIS:
   * Diese Implementierung ermöglicht das Testen dreier wissenschaftlich fundierter Prompt-Ansätze
   * mit zusätzlicher Wahl zwischen originalgetreuer SwiftUI-Fokussierung und generalisierter UI-Bewertung:
   * 
   * A. "STUDY-PURE" - Originale IEEE-Studie "Does GenAI Make Usability Testing Obsolete?"
   *    SwiftUI-Only Modus:
   *    - Exakte Replikation der Originalstudie (Prof. Femmer Empfehlung)
   *    - Nur für iOS/SwiftUI-Apps (wie in der ursprünglichen Forschung)
   *    - Direkte Vergleichbarkeit mit publizierten Ergebnissen
   *    - Methodisch konsistent und wissenschaftlich fundiert
   *    
   *    Generalisierter Modus:
   *    - Systemübergreifendes Know-how zur UI-Bewertung
   *    - Verschiedene UI-Technologien (SwiftUI, React, Flutter, HTML/CSS)
   *    - Erweiterte Anwendbarkeit für moderne Forschungsrichtungen
   *    - Unterstellt dem LLM breitere UI-Expertise
   * 
   * B. "BASIC" - Adaptierte Version basierend auf UX-LLM Studie (IEEE Xplore: 11029918)
   *    - Minimalistischer Ansatz mit einfacher Kategorisierung
   *    - Kurze, prägnante Instruktionen
   *    - Fokus auf offene Problemidentifikation
   *    - Sprache wählbar (DE/EN)
   * 
   * C. "ADVANCED" - Erweiterte Variante für Thesis-Level Analyse
   *    - Detaillierte Expertise-Beschreibung mit wissenschaftlicher Kategorisierung
   *    - Strukturierte Problemkategorien basierend auf Usability-Test-Ergebnissen
   *    - Wissenschaftliche Analysemethodik mit Nielsen's Heuristiken
   *    - Umfassende Qualitätskriterien und ISO-Standards
   * 
   * UI-TECHNOLOGIE-MODI:
   * - 'swiftui-only': Originalgetreu für direkte Studienreplikation (empfohlen für STUDY-PURE)
   * - 'generalized': Systemübergreifend für moderne Multi-Platform-Anwendungen
   * 
   * Verwendung für A/B/C Testing:
   * - Verwende 'STUDY-PURE' + 'swiftui-only' für exakte IEEE-Studien-Replikation
   * - Verwende 'STUDY-PURE' + 'generalized' für erweiterte Anwendbarkeit
   * - Verwende 'BASIC' für vereinfachte deutsche/englische Evaluation
   * - Verwende 'ADVANCED' für detaillierte wissenschaftliche Thesis-Analyse
   * - Dokumentiere Ergebnisse aller Varianten für empirische Auswertung
   */
  static readonly PROMPT_VARIANTS = {
    STUDY_PURE: 'study-pure',  // A: Original IEEE-Studie
    BASIC: 'basic',              // B: Minimalistisch, studienbasiert (deutsch)
    ADVANCED: 'advanced'       // C: Erweitert, thesis-level
  } as const;

  /**
   * Erstellt einen strukturierten Prompt für die Usability-Analyse
   * mit Persona-Instruktion und klarer Inputgestaltung
   * 
   * @param appContext - App-Kontext für die Analyse
   * @param includeExamples - Ob Beispiele inkludiert werden sollen
   * @param customPrompt - Benutzerdefinierte Zusatzanweisungen
   * @param variant - Prompt-Variante für A/B/C Testing ('study-pure', 'basic' oder 'advanced')
   * @param language - Sprache der Prompts ('de' für Deutsch, 'en' für Englisch)
   * @param uiMode - 'swiftui-only' für originalgetreue Studie oder 'generalized' für verschiedene UI-Technologien
   */
  static createUsabilityPrompt(
    appContext: AppContext, 
    includeExamples: boolean = false, 
    customPrompt?: string,
    variant: PromptVariant = 'advanced',
    language: 'de' | 'en' = 'de',
    uiMode: UITechnologyMode = 'generalized'
  ): string {
    console.log('🔍 PromptEngineer Debug - Creating prompt with variant:', variant, 'UI mode:', uiMode)
    
    // Für STUDY-PURE: Nur System-Prompt + User-Input (originalgetreu)
    if (variant === 'study-pure') {
      const systemPrompt = this.getStudyPureSystemPrompt(language, uiMode)
      const userInput = this.formatStudyPureInput(appContext, language, uiMode)
      
      console.log('🔍 PromptEngineer Debug - STUDY-PURE: System prompt length:', systemPrompt.length)
      console.log('🔍 PromptEngineer Debug - STUDY-PURE: User input length:', userInput.length)
      console.log('🔍 PromptEngineer Debug - STUDY-PURE: Language:', language, 'UI Mode:', uiMode)
      
      // Für STUDY-PURE werden keine Custom-Prompts, Beispiele oder zusätzliche Instruktionen verwendet
      // um die Originalität der IEEE-Studie zu bewahren
      return `${systemPrompt}

${userInput}`
    }
    
    // Für andere Varianten: Vollständige Struktur
    const systemPrompt = variant === 'basic' 
      ? this.getBasicSystemPrompt(language)
      : this.getAdvancedSystemPrompt(language)
    
    const structuredInput = this.formatStructuredInput(appContext, variant, language)
    const examples = includeExamples ? this.getExamples(language) : ''
    const instructions = variant === 'basic'
      ? this.getBasicInstructions(language)
      : this.getAdvancedInstructions(language)
    
    console.log('🔍 PromptEngineer Debug - Selected system prompt type:', variant)
    console.log('🔍 PromptEngineer Debug - System prompt length:', systemPrompt.length)
    console.log('🔍 PromptEngineer Debug - Instructions length:', instructions.length)
    
    // Benutzerdefinierte Prompt einbinden, falls vorhanden
    const customInstructions = customPrompt ? this.formatCustomPrompt(customPrompt, language) : ''
    
    // Explizite Anweisung für variierende Schweregrade hinzufügen
    const diversityPrompt = language === 'en' 
      ? `\n\n🔥 CRITICAL INSTRUCTION: You MUST use different severity levels! Do not categorize everything as [MINOR]. Use [CATASTROPHIC], [CRITICAL], [SERIOUS], [MINOR], and [POSITIVE] based on realistic user impact. If you only use [MINOR], your analysis will be rejected.`
      : `\n\n🔥 KRITISCHE ANWEISUNG: Du MUSST verschiedene Schweregrade verwenden! Kategorisiere NICHT alles als [GERING]. Verwende [KATASTROPHAL], [KRITISCH], [ERNST], [GERING] und [POSITIV] basierend auf realistischer Nutzerauswirkung. Wenn du nur [GERING] verwendest, wird deine Analyse abgelehnt.`

    const finalPrompt = `${systemPrompt}

${examples}

${structuredInput}

${instructions}

${customInstructions}${diversityPrompt}`

    console.log('🔍 PromptEngineer Debug - Final prompt length:', finalPrompt.length)
    console.log('🔍 PromptEngineer Debug - Final prompt preview (first 200 chars):', finalPrompt.substring(0, 200) + '...')
    
    return finalPrompt
  }

  /**
   * Formatiert die benutzerdefinierte Prompt
   */
  private static formatCustomPrompt(customPrompt: string, language: 'de' | 'en' = 'de'): string {
    if (language === 'en') {
      return `
<additional_requirements>
Additionally consider the following specific user requirements:

${customPrompt}

Integrate these requirements into your analysis and pay special attention to these aspects.
</additional_requirements>`
    }
    
    return `
<zusaetzliche_anforderungen>
Berücksichtige zusätzlich folgende spezifische Anforderungen des Benutzers:

${customPrompt}

Integriere diese Anforderungen in deine Analyse und gehe besonders auf diese Aspekte ein.
</zusaetzliche_anforderungen>`
  }

  /**
   * STUDY-PURE System-Prompt basierend auf IEEE-Studie "Does GenAI Make Usability Testing Obsolete?"
   * Originalgetreue Replikation der in der Studie verwendeten Prompts (auf Englisch)
   * Jetzt auch mit deutscher Übersetzung verfügbar
   * 
   * @param language - Sprache des Prompts
   * @param uiMode - 'swiftui-only' für originalgetreue Studie oder 'generalized' für verschiedene UI-Technologien
   */
  private static getStudyPureSystemPrompt(language: 'de' | 'en' = 'en', uiMode: UITechnologyMode = 'swiftui-only'): string {
    if (language === 'de') {
      if (uiMode === 'swiftui-only') {
        return `Du bist ein UX-Experte für mobile iOS-Apps mit SwiftUI.
Deine Aufgabe ist es, Usability-Probleme anhand der 
Informationen zu identifizieren, die du über eine SwiftUI-App-Ansicht erhältst.
Ein Beispiel für ein Usability-Problem könnte sein: 'Fehlendes
visuelles Feedback bei Nutzerinteraktionen'.
Antworte in der Sprache der App-Domäne; du darfst keine
technische Terminologie verwenden oder Code-Details erwähnen.
Zähle die identifizierten Probleme auf; füge nach jeder 
Aufzählung einen leeren Absatz hinzu; kein vorangestellter
oder nachfolgender Text.`
      } else {
        return `Du bist ein UX-Experte für mobile Apps und Webanwendungen.
Deine Aufgabe ist es, Usability-Probleme anhand der 
Informationen zu identifizieren, die du über eine App-Ansicht erhältst.
Du verfügst über systemübergreifendes Know-how zur UI-Bewertung 
für verschiedene Technologien (SwiftUI, React, Flutter, etc.).
Ein Beispiel für ein Usability-Problem könnte sein: 'Fehlendes
visuelles Feedback bei Nutzerinteraktionen'.
Antworte in der Sprache der App-Domäne; du darfst keine
technische Terminologie verwenden oder Code-Details erwähnen.
Zähle die identifizierten Probleme auf; füge nach jeder 
Aufzählung einen leeren Absatz hinzu; kein vorangestellter
oder nachfolgender Text.`
      }
    }
    
    if (uiMode === 'swiftui-only') {
      return `You are a UX expert for mobile iOS apps with SwiftUI.
Your task is to identify usability issues with the
information you get for a SwiftUI app's view.
An example of a usability issue could be: 'Lack of
visual feedback on user interactions'.
Respond using app domain language; you must not use
technical terminology or mention code details.
Enumerate the problems identified; add an empty
paragraph after each enumeration; no preceding
or following text.`
    } else {
      return `You are a UX expert for mobile apps and web applications.
Your task is to identify usability issues with the
information you get for an app's view.
You have cross-platform expertise in UI evaluation 
for various technologies (SwiftUI, React, Flutter, etc.).
An example of a usability issue could be: 'Lack of
visual feedback on user interactions'.
Respond using app domain language; you must not use
technical terminology or mention code details.
Enumerate the problems identified; add an empty
paragraph after each enumeration; no preceding
or following text.`
    }
  }

  /**
   * BASIC System-Prompt basierend auf UX-LLM Studie (IEEE Xplore: 11029918)
   * Minimalistische Instruktionen für studienkonformen Ansatz
   */
  private static getBasicSystemPrompt(language: 'de' | 'en' = 'de'): string {
    if (language === 'en') {
      return `You are a UX expert for mobile apps. Your task is to identify usability issues based on the information you get about an app view. An example of a usability issue could be: 'Lack of visual feedback on user interactions'.

Respond using app domain language; you must not use technical terminology or mention code details. Enumerate the problems identified; add an empty paragraph after each enumeration; no preceding or following text.`
    }
    
    return `Du bist ein UX-Experte für mobile Apps. Deine Aufgabe ist es, Usability-Probleme basierend auf den Informationen über eine App-Ansicht zu identifizieren. Ein Beispiel für ein Usability-Problem könnte sein: 'Fehlendes visuelles Feedback bei Nutzerinteraktionen'.

Antworte in der App-Domänen-Sprache; verwende keine technische Terminologie und erwähne keine Code-Details. Zähle die identifizierten Probleme auf; füge einen leeren Absatz nach jeder Aufzählung hinzu; keine einleitenden oder abschließenden Texte.`
  }

  /**
   * ADVANCED System-Prompt für detaillierte Thesis-Level Analyse
   * Umfassende Expertise-Beschreibung mit wissenschaftlicher Fundierung
   * Subtile Integration von Nielsen's Heuristiken und ISO-Standards als Bewertungskriterien
   */
  private static getAdvancedSystemPrompt(language: 'de' | 'en' = 'de'): string {
    if (language === 'en') {
      return this.getAdvancedSystemPromptEN()
    }
    
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
   * ADVANCED System-Prompt für detaillierte Thesis-Level Analyse (Englisch)
   * Umfassende Expertise-Beschreibung mit wissenschaftlicher Fundierung
   * Subtile Integration von Nielsen's Heuristiken und ISO-Standards als Bewertungskriterien
   */
  private static getAdvancedSystemPromptEN(): string {
    return `You are an experienced UX expert with specialized expertise in mobile app evaluation. Your task is to systematically identify and assess usability issues based on established UX principles and scientific findings.

## Your expertise includes:
• **Mobile Usability**: Specialized knowledge of iOS and Android interface guidelines
• **Visual Hierarchy**: Analysis of contrasts, typography, and layout structures  
• **Interaction Design**: Evaluation of touch targets, feedback mechanisms, and micro-interactions
• **Accessibility**: WCAG 2.1 compliance and assistive technologies
• **User Psychology**: Mental models, cognitive load, and attention guidance
• **User Guidance**: Analysis of workflows, learnability, and user autonomy

## Analysis methodology (based on UX-LLM research):
**Focus on the following proven problem categories:**

### Visual and Perception Problems:
- Contrast issues between text and background
- Inconsistent color schemes or theme handling
- Missing visual hierarchy or information architecture
- Illegible or too small font sizes
- Problematic icon usage without labels

### Interaction and Feedback Problems:
- Lack of visual feedback on user interactions
- Unclear or ambiguous controls
- Too small touch targets (below 44px)
- Inconsistent interaction patterns
- Missing or confusing loading states

### Navigation and Orientation Problems:
- Unclear navigation or information architecture
- Missing orientation aids (breadcrumbs, progress indicators)
- Inconsistent or confusing button labels
- Problematic back button functionality
- Ambiguous or hidden features

### Content and Comprehensibility Problems:
- Unclear or missing descriptions
- Inconsistent terminology
- Missing mandatory field indicators
- Information overload or unstructured content
- Missing help or context information

### Efficiency and Control:
- Cumbersome or inefficient workflows
- Missing shortcuts or abbreviations for recurring tasks
- Insufficient user guidance for complex processes
- Missing undo/redo functionality
- Lack of customization options for user preferences

### Error Handling and Prevention:
- Missing input validation or unclear error messages
- Insufficient error prevention for critical actions
- Missing confirmation dialogs for important decisions
- Hard-to-understand or technical error messages
- Missing recovery options after errors

### Consistency and Standards:
- Deviations from established platform conventions
- Inconsistent terminology or labeling
- Contradictory interaction patterns within the app
- Lack of alignment with users' mental models
- Deviations from industry standards

### Accessibility and Inclusion:
- Problems for users with visual impairments
- Missing alternative texts or labels
- Problematic color coding as the only information
- Lack of keyboard navigation support
- Insufficient support for assistive technologies

## Important Analysis Principles:
- **User-centered**: Describe problems from the perspective of real users, not from a technical perspective
- **Concrete and specific**: Reference specific UI elements and their problems
- **Contextual**: Consider different usage scenarios and user groups
- **Evidence-based**: Justify each problem with understandable effects
- **Solution-oriented**: Imply practical improvement possibilities

## Output format:
Structure your analysis clearly and concisely:
1. Identify problems without numbering or bullet points
2. Describe each problem in a separate paragraph
3. Use clear, understandable language without technical terms
4. Add a blank line after each enumeration
5. Avoid introductory or concluding texts

Focus on the most important and effective usability problems that real users would be hindered by in real situations.`
  }

  /**
   * STUDY-PURE Instructions basierend auf IEEE-Studie "Does GenAI Make Usability Testing Obsolete?"
   * Keine zusätzlichen Instruktionen - die Eingabe spricht für sich selbst wie in der Originalstudie
   */
  private static getStudyPureInstructions(): string {
    return '' // Keine zusätzlichen Instruktionen im originalen Format
  }

  /**
   * BASIC Instructions basierend auf UX-LLM Studie (IEEE Xplore: 11029918)
   * Minimale, offene Problemidentifikation ohne strukturelle Zwänge
   */
  private static getBasicInstructions(language: 'de' | 'en' = 'de'): string {
    if (language === 'en') {
      return `Analyze the provided app view and identify usability issues. Focus on problems that would affect real users in actual usage scenarios.

Describe each problem in a separate paragraph with an empty line between problems. Use domain-specific language and avoid technical terminology.

## IMPORTANT: Categorization of Findings
Each finding MUST begin with one of the following assessments. Use the full range of severity levels:

**[CATASTROPHIC]** - App is completely unusable, basic functions are missing or broken
**[CRITICAL]** - Serious problems that cause major user frustration or task abandonment
**[SERIOUS]** - Significant impairment of user experience, but tasks are still achievable
**[MINOR]** - Small inconveniences that slightly reduce efficiency
**[POSITIVE]** - Well-designed aspects that improve the user experience

IMPORTANT: Use different severity levels! Rate realistically based on actual user impact.

Example: **[CRITICAL]** Missing visual feedback makes users uncertain about their interactions.`
    }
    
    return `Analysiere die bereitgestellte App-Ansicht und identifiziere Usability-Probleme. Konzentriere dich auf Probleme, die echte Nutzer in tatsächlichen Nutzungsszenarien beeinträchtigen würden.

Beschreibe jedes Problem in einem separaten Absatz mit einer Leerzeile zwischen den Problemen. Verwende domänenspezifische Sprache und vermeide technische Terminologie.

## WICHTIG: Kategorisierung der Befunde
Jeder Befund MUSS mit einer der folgenden Bewertungen beginnen. Nutze die volle Bandbreite der Schweregrade:

**[KATASTROPHAL]** - App ist völlig unbrauchbar, grundlegende Funktionen fehlen oder funktionieren nicht
**[KRITISCH]** - Schwere Probleme, die Nutzer stark frustrieren oder zum Abbruch führen
**[ERNST]** - Deutliche Beeinträchtigung der Nutzererfahrung, aber Aufgaben sind noch erfüllbar
**[GERING]** - Kleinere Unannehmlichkeiten, die die Effizienz leicht reduzieren
**[POSITIV]** - Gut gestaltete Aspekte, die das Nutzererlebnis verbessern

WICHTIG: Verwende verschiedene Schweregrade! Bewerte realistisch basierend auf der tatsächlichen Nutzerauswirkung.

Beispiel: **[KRITISCH]** Fehlendes visuelles Feedback macht Nutzer unsicher über ihre Interaktionen.`
  }

  /**
   * ADVANCED Instructions für detaillierte wissenschaftliche Analyse
   * Umfassende Anweisungen für systematische Problemidentifikation
   */
  private static getAdvancedInstructions(language: 'de' | 'en' = 'de'): string {
    if (language === 'en') {
      return `<instructions>
Analyze the provided app view and identify usability issues based on the app domain and user perspective.

## Structured Input Analysis:
You will receive the following information:
- **App Description**: Context and purpose of the application
- **User Task**: Main goal of interaction with this view  
- **View Name**: Name of the current screen view
- **Source Code**: SwiftUI/React/Other code of the view (if available)
- **Screenshot**: Visual state of the application

## Analysis Focus (based on UX-LLM Research):
Focus on problems that affect **real users in actual situations**:

### Visual Perception:
- Color contrasts and readability in different lighting conditions
- Font sizes and their scalability  
- Visual hierarchy and information architecture
- Icon comprehensibility without text labels

### Interaction and Feedback:
- Visual feedback on user interactions
- Touch target sizes (minimum 44px for mobile devices)
- Loading states and wait time indicators
- Clarity of interactive elements

### Navigation and Orientation:
- Clarity of navigation structure
- Orientation aids and progress indicators
- Back button functionality and labeling
- Discoverability of hidden functions

### Content and Comprehensibility:
- Clarity of descriptions and labels
- Consistency in terminology and designations
- Marking of required fields
- Comprehensibility of error messages

### Accessibility:
- Support for users with visual impairments
- Alternative texts and labels for screen readers
- Keyboard navigation and assistive technologies
- Color coding as the only source of information

## Output Format (strictly follow):
- **No introductory or concluding texts**
- **Each problem in a standalone paragraph**
- **One blank line after each problem**
- **User-oriented language without technical jargon**
- **No numbering or bullet points**
- **Don't mention code details or technical terminology**

## IMPORTANT: Categorization of Findings
Each finding MUST begin with one of the following assessments:

**[CATASTROPHIC]** - Existential threats, there is a risk of major damage to the user or organization. This assessment should only be given after consultation with management, never by the UX professional alone.
**[CRITICAL]** - Test participants have given up or are very dissatisfied, or there is a risk of minor damage to the user
**[SERIOUS]** - Significant delays or moderate dissatisfaction
**[MINOR]** - Noticeable delays or minor dissatisfaction
**[POSITIVE]** - Something that worked well in the current usability test or that test participants liked

Example of correct format:
**[CRITICAL]** Missing interaction hints make it difficult for users to understand which elements are clickable, causing test participants to give up.

**[POSITIVE]** The color scheme is consistent and was well-received by test participants as it supports a clear visual hierarchy.

**[SERIOUS]** Font sizes that are too small cause significant delays in reading and lead to moderate dissatisfaction in poor lighting conditions.

Conduct an open, exploratory problem identification without limiting the number of problems. Let yourself be guided by the provided input and identify the most important usability challenges for real users.
</instructions>`
    }
    
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

## Ausgabeformat (strikt befolgen):
- **Keine einleitende oder abschließende Texte**
- **Jedes Problem in einem eigenständigen Absatz**
- **Eine Leerzeile nach jedem Problem**
- **Nutzerorientierte Sprache ohne Fachbegriffe**
- **Keine Nummerierung oder Bulletpoints**
- **Keine Code-Details oder technische Terminologie erwähnen**

## WICHTIG: Kategorisierung der Befunde
Jeder Befund MUSS mit einer der folgenden Bewertungen beginnen. Verwende die volle Bandbreite der Kategorien basierend auf der tatsächlichen Auswirkung auf Nutzer:

**[KATASTROPHAL]** - App ist völlig unbrauchbar, Nutzer können grundlegende Aufgaben nicht erfüllen (z.B. Login unmöglich, App stürzt ab, kritische Funktionen fehlen komplett)
**[KRITISCH]** - Schwerwiegende Probleme, die Nutzer stark frustrieren oder zum Abbruch führen (z.B. versteckte wichtige Buttons, verwirrende Navigation, unverständliche Fehlermeldungen)
**[ERNST]** - Deutliche Beeinträchtigung der Nutzererfahrung, aber Aufgaben sind noch erfüllbar (z.B. lange Ladezeiten, unintuitives Design, schwer findbare Funktionen)
**[GERING]** - Kleinere Unannehmlichkeiten, die die Effizienz leicht reduzieren (z.B. suboptimale Textstile, leichte Inkonsistenzen, verbesserungswürdige Details)
**[POSITIV]** - Gut gestaltete Aspekte, die das Nutzererlebnis verbessern (z.B. klare Struktur, hilfreiche Feedback-Mechanismen, ansprechendes Design)

WICHTIG: Nutze verschiedene Schweregrade! Nicht alle Probleme sind "gering" - bewerte realistisch basierend auf der Nutzerauswirkung.

Beispiel für korrektes Format:
**[KRITISCH]** Fehlende Interaktionshinweise machen es für Nutzer schwierig zu verstehen, welche Elemente anklickbar sind, was dazu führt, dass Testteilnehmer aufgeben.

**[POSITIV]** Die Farbgebung ist konsistent und hat den Testteilnehmern gut gefallen, da sie eine klare visuelle Hierarchie unterstützt.

**[ERNST]** Zu kleine Schriftgrößen verursachen erhebliche Verzögerungen beim Lesen und führen zu mäßiger Unzufriedenheit bei schlechten Lichtverhältnissen.

Führe eine offene, explorative Problemidentifikation durch ohne Begrenzung der Anzahl der Probleme. Lass dich von der bereitgestellten Eingabe leiten und identifiziere die wichtigsten Usability-Herausforderungen für echte Nutzer.
</instructions>`
  }

  /**
   * Strukturierte Eingabe mit XML-ähnlichen Tags
   * Basiert auf UX-LLM Studie: "Use delimiters to clearly indicate distinct parts of the input"
   * Trennt verschiedene Informationskomponenten klar voneinander für bessere LLM-Verarbeitung
   * 
   * @param appContext - Der App-Kontext
   * @param variant - Die Prompt-Variante (bestimmt das Format)
   */
  private static formatStructuredInput(appContext: AppContext, variant?: PromptVariant, language: 'de' | 'en' = 'de'): string {
    // Für STUDY-PURE verwenden wir das originale Format aus der IEEE-Studie
    if (variant === 'study-pure') {
      return this.formatStudyPureInput(appContext, language)
    }
    
    // Für andere Varianten verwenden wir das XML-ähnliche Format
    if (language === 'en') {
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
[Das bereitgestellte Bild zeigt den aktuellen Zustand der Anwendung]
</image>`
  }

  /**
   * Formatiert die Eingabe im originalen IEEE-Studien-Format
   * Jetzt auch mit deutscher Übersetzung und UI-Modus verfügbar
   * 
   * @param appContext - Der App-Kontext
   * @param language - Sprache des Inputs
   * @param uiMode - 'swiftui-only' für originalgetreue Studie oder 'generalized' für verschiedene UI-Technologien
   */
  private static formatStudyPureInput(appContext: AppContext, language: 'de' | 'en' = 'en', uiMode: UITechnologyMode = 'swiftui-only'): string {
    if (language === 'de') {
      if (uiMode === 'swiftui-only') {
        return `Ich habe eine iOS-App über: ${appContext.appDescription}
Die Aufgabe des Nutzers in dieser App-Ansicht handelt von: ${appContext.userTask}.
Ein Bild der App-Ansicht wird bereitgestellt.
Unten ist der unvollständige SwiftUI-Code für die App-
Ansicht.
Dieser Code enthält die Benutzeroberfläche der Ansicht und ein
View Model für die Logik-Behandlung.
Er kann auch zusätzliche Komponenten wie
Unteransichten, Modelle oder Vorschau-Code enthalten.
Quellcode:
${appContext.sourceCode || '[Kein Quellcode bereitgestellt]'}`
      } else {
        return `Ich habe eine Anwendung über: ${appContext.appDescription}
Die Aufgabe des Nutzers in dieser Ansicht handelt von: ${appContext.userTask}.
Ein Bild der Anwendung wird bereitgestellt.
Unten ist der Quellcode für die Ansicht (falls verfügbar).
Dieser Code kann verschiedene UI-Technologien verwenden 
(SwiftUI, React, HTML/CSS, Flutter, etc.).
Quellcode:
${appContext.sourceCode || '[Kein Quellcode bereitgestellt]'}`
      }
    }
    
    if (uiMode === 'swiftui-only') {
      return `I have an iOS app about: ${appContext.appDescription}
The user's task in this app view is about: ${appContext.userTask}.
An image of the app view is provided.
Below is the incomplete SwiftUI code for the app
view.
This code includes the view's user interface and a
view model for logic handling.
It may also include additional components like
subviews, models, or preview code.
Source Code:
${appContext.sourceCode || '[No source code provided]'}`
    } else {
      return `I have an application about: ${appContext.appDescription}
The user's task in this view is about: ${appContext.userTask}.
An image of the application is provided.
Below is the source code for the view (if available).
This code may use various UI technologies 
(SwiftUI, React, HTML/CSS, Flutter, etc.).
Source Code:
${appContext.sourceCode || '[No source code provided]'}`
    }
  }

  /**
   * Nutzerorientierte Beispiele für freie Problemidentifikation
   * Basiert auf UX-LLM Studie: Offene Problemidentifikation ohne strukturelle Zwänge
   * Nutzt One-Shot Prompting mit konkreten Beispielen aus der wissenschaftlichen Forschung
   */
  private static getExamples(language: 'de' | 'en' = 'de'): string {
    if (language === 'de') {
      return `<examples>
**Beispiele für korrekte Kategorisierung verschiedener Schweregrade:**

**[KATASTROPHAL]** Login-Button ist völlig unsichtbar und nicht funktionsfähig. Nutzer können sich nicht anmelden und die App ist somit unbrauchbar.

**[KRITISCH]** Fehlende visuelles Feedback bei kritischen Aktionen wie "Kauf abschließen" führt dazu, dass Nutzer unsicher sind und den Vorgang abbrechen.

**[ERNST]** Navigation zwischen Bildschirmen ist verwirrend und unintuitiv, was zu längeren Suchzeiten und mäßiger Nutzerfrustration führt.

**[GERING]** Schriftgröße in der Fußzeile ist etwas klein, beeinträchtigt aber die Hauptfunktionen nicht wesentlich.

**[POSITIV]** Klare Farbcodierung und konsistente Symbole unterstützen eine intuitive Bedienung und wurden von Testteilnehmern positiv bewertet.

**WICHTIG: Verwende diese vollständige Bandbreite von Kategorien in deiner Analyse!**
</examples>`
    }
    
    return `<examples>
**Examples of correct categorization across different severity levels:**

**[CATASTROPHIC]** Login button is completely invisible and non-functional. Users cannot log in and the app is therefore unusable.

**[CRITICAL]** Missing visual feedback for critical actions like "Complete Purchase" causes users to be uncertain and abandon the process.

**[SERIOUS]** Navigation between screens is confusing and unintuitive, leading to longer search times and moderate user frustration.

**[MINOR]** Font size in the footer is somewhat small, but does not significantly impact main functions.

**[POSITIVE]** Clear color coding and consistent icons support intuitive operation and were positively rated by test participants.

**IMPORTANT: Use this full range of categories in your analysis!**
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
   * A/B/C Testing Utility für einfache Prompt-Varianten-Auswahl
   * Bietet eine einfache Schnittstelle für das Testen aller drei Varianten
   * 
   * @param appContext - App-Kontext für die Analyse
   * @param variant - Welche Variante verwendet werden soll
   * @param includeExamples - Ob Beispiele inkludiert werden sollen
   * @param customPrompt - Optionale benutzerdefinierte Zusatzanweisungen
   * @param language - Sprache der Prompts
   * @param uiMode - UI-Technologie-Modus
   * @returns Strukturierter Prompt für die gewählte Variante
   */
  static createABCTestPrompt(
    appContext: AppContext,
    variant: PromptVariant = 'advanced',
    includeExamples: boolean = false,
    customPrompt?: string,
    language: 'de' | 'en' = 'de',
    uiMode: UITechnologyMode = 'generalized'
  ): string {
    return this.createUsabilityPrompt(appContext, includeExamples, customPrompt, variant, language, uiMode)
  }

  /**
   * Legacy A/B Testing Utility - behält Kompatibilität bei
   */
  static createABTestPrompt(
    appContext: AppContext,
    testPure: boolean = false,
    includeExamples: boolean = false,
    customPrompt?: string,
    language: 'de' | 'en' = 'de',
    uiMode: UITechnologyMode = 'generalized'
  ): string {
    const variant: PromptVariant = testPure ? 'basic' : 'advanced'
    return this.createUsabilityPrompt(appContext, includeExamples, customPrompt, variant, language, uiMode)
  }

  /**
   * Erstellt alle drei Prompt-Varianten für direkten Vergleich
   * Nützlich für die wissenschaftliche Auswertung und Dokumentation
   * 
   * @param appContext - App-Kontext für die Analyse
   * @param includeExamples - Ob Beispiele inkludiert werden sollen
   * @param customPrompt - Optionale benutzerdefinierte Zusatzanweisungen
   * @param language - Sprache der Prompts
   * @param uiMode - UI-Technologie-Modus
   * @returns Objekt mit allen drei Prompt-Varianten
   */
  static createAllVariants(
    appContext: AppContext,
    includeExamples: boolean = false,
    customPrompt?: string,
    language: 'de' | 'en' = 'de',
    uiMode: UITechnologyMode = 'generalized'
  ): { studyPure: string; basic: string; advanced: string } {
    return {
      studyPure: this.createUsabilityPrompt(appContext, includeExamples, customPrompt, 'study-pure', language, uiMode),
      basic: this.createUsabilityPrompt(appContext, includeExamples, customPrompt, 'basic', language, uiMode),
      advanced: this.createUsabilityPrompt(appContext, includeExamples, customPrompt, 'advanced', language, uiMode)
    }
  }

  /**
   * Legacy-Kompatibilität: Erstellt beide ursprüngliche Varianten
   */
  static createBothVariants(
    appContext: AppContext,
    includeExamples: boolean = false,
    customPrompt?: string,
    language: 'de' | 'en' = 'de',
    uiMode: UITechnologyMode = 'generalized'
  ): { basic: string; advanced: string } {
    return {
      basic: this.createUsabilityPrompt(appContext, includeExamples, customPrompt, 'basic', language, uiMode),
      advanced: this.createUsabilityPrompt(appContext, includeExamples, customPrompt, 'advanced', language, uiMode)
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
