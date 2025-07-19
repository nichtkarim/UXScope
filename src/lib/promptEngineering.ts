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

export class PromptEngineer {
  /**
   * A/B/C Testing Konfiguration für Prompt-Varianten
   * 
   * FORSCHUNGS-HINWEIS:
   * Diese Implementierung ermöglicht das Testen dreier wissenschaftlich fundierter Prompt-Ansätze:
   * 
   * A. "STUDY-PURE" - Originale IEEE-Studie "Does GenAI Make Usability Testing Obsolete?"
   *    - Exakte Replikation der Originalstudie
   *    - Englischsprachige Prompts wie in der Forschung
   *    - Direkte Vergleichbarkeit mit publizierten Ergebnissen
   *    - Minimale Instruktionen ohne zusätzliche Strukturierung
   * 
   * B. "BASIC" - Adaptierte Version basierend auf UX-LLM Studie (IEEE Xplore: 11029918)
   *    - Deutsche Übersetzung des minimalistischen Ansatzes
   *    - Kurze, prägnante Instruktionen
   *    - Fokus auf offene Problemidentifikation
   *    - Keine detaillierten Kategorien oder Frameworks
   * 
   * C. "ADVANCED" - Erweiterte Variante für Thesis-Level Analyse
   *    - Detaillierte Expertise-Beschreibung
   *    - Strukturierte Problemkategorien
   *    - Wissenschaftliche Analysemethodik
   *    - Umfassende Qualitätskriterien
   * 
   * Verwendung für A/B/C Testing:
   * - Verwende 'STUDY-PURE' für direkte Replikation der IEEE-Studie
   * - Verwende 'BASIC' für deutsche Adaptation der minimalistischen Methode
   * - Verwende 'ADVANCED' für detailliertere wissenschaftliche Analyse
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
   */
  static createUsabilityPrompt(
    appContext: AppContext, 
    includeExamples: boolean = false, 
    customPrompt?: string,
    variant: PromptVariant = 'advanced',
    language: 'de' | 'en' = 'de'
  ): string {
    console.log('🔍 PromptEngineer Debug - Creating prompt with variant:', variant)
    
    // Für STUDY-PURE: Nur System-Prompt + User-Input (originalgetreu)
    if (variant === 'study-pure') {
      const systemPrompt = this.getStudyPureSystemPrompt(language)
      const userInput = this.formatStudyPureInput(appContext, language)
      
      console.log('🔍 PromptEngineer Debug - STUDY-PURE: System prompt length:', systemPrompt.length)
      console.log('🔍 PromptEngineer Debug - STUDY-PURE: User input length:', userInput.length)
      console.log('🔍 PromptEngineer Debug - STUDY-PURE: Language:', language)
      
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
   */
  private static getStudyPureSystemPrompt(language: 'de' | 'en' = 'en'): string {
    if (language === 'de') {
      return `Du bist ein UX-Experte für mobile Apps.
Deine Aufgabe ist es, Usability-Probleme anhand der 
Informationen zu identifizieren, die du über eine App-Ansicht erhältst.
Ein Beispiel für ein Usability-Problem könnte sein: 'Fehlendes
visuelles Feedback bei Nutzerinteraktionen'.
Antworte in der Sprache der App-Domäne; du darfst keine
technische Terminologie verwenden oder Code-Details erwähnen.
Zähle die identifizierten Probleme auf; füge nach jeder 
Aufzählung einen leeren Absatz hinzu; kein vorangestellter
oder nachfolgender Text.`
    }
    
    return `You are a UX expert for mobile apps.
Your task is to identify usability issues with the
information you get for an app's view.
An example of a usability issue could be: 'Lack of
visual feedback on user interactions'.
Respond using app domain language; you must not use
technical terminology or mention code details.
Enumerate the problems identified; add an empty
paragraph after each enumeration; no preceding
or following text.`
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

Describe each problem in a separate paragraph with an empty line between problems. Use domain-specific language and avoid technical terminology.`
    }
    
    return `Analysiere die bereitgestellte App-Ansicht und identifiziere Usability-Probleme. Konzentriere dich auf Probleme, die echte Nutzer in tatsächlichen Nutzungsszenarien beeinträchtigen würden.

Beschreibe jedes Problem in einem separaten Absatz mit einer Leerzeile zwischen den Problemen. Verwende domänenspezifische Sprache und vermeide technische Terminologie.`
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

**[CATASTROPHIC]** - For severe problems that make the app unusable or completely block important tasks
**[CRITICAL]** - For serious problems that strongly impair user-friendliness
**[SERIOUS]** - For significant problems that noticeably worsen the user experience
**[MINOR]** - For smaller problems that have only minor effects
**[POSITIVE]** - For positive aspects and strengths of the user interface

Example of correct format:
**[CRITICAL]** Missing interaction hints make it difficult for users to understand which elements are clickable.

**[POSITIVE]** The color scheme is consistent and supports a clear visual hierarchy.

**[SERIOUS]** Font sizes that are too small can impair readability in poor lighting conditions.

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
Jeder Befund MUSS mit einer der folgenden Bewertungen beginnen:

**[KATASTROPHAL]** - Für schwerwiegende Probleme, die die App unbrauchbar machen oder wichtige Aufgaben komplett blockieren
**[KRITISCH]** - Für schwere Probleme, die die Nutzerfreundlichkeit stark beeinträchtigen
**[ERNST]** - Für erhebliche Probleme, die die Nutzererfahrung spürbar verschlechtern
**[GERING]** - Für kleinere Probleme, die nur geringfügige Auswirkungen haben
**[POSITIV]** - Für positive Aspekte und Stärken der Benutzeroberfläche

Beispiel für korrektes Format:
**[KRITISCH]** Fehlende Interaktionshinweise machen es für Nutzer schwierig zu verstehen, welche Elemente anklickbar sind.

**[POSITIV]** Die Farbgebung ist konsistent und unterstützt eine klare visuelle Hierarchie.

**[ERNST]** Zu kleine Schriftgrößen können die Lesbarkeit bei schlechten Lichtverhältnissen beeinträchtigen.

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
   * Jetzt auch mit deutscher Übersetzung verfügbar
   */
  private static formatStudyPureInput(appContext: AppContext, language: 'de' | 'en' = 'en'): string {
    if (language === 'de') {
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
    }
    
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
  }

  /**
   * Nutzerorientierte Beispiele für freie Problemidentifikation
   * Basiert auf UX-LLM Studie: Offene Problemidentifikation ohne strukturelle Zwänge
   * Nutzt One-Shot Prompting mit konkreten Beispielen aus der wissenschaftlichen Forschung
   */
  private static getExamples(language: 'de' | 'en' = 'de'): string {
    if (language === 'de') {
      return `<examples>
**Beispiel eines validen Usability-Problems (basierend auf UX-LLM Forschung):**

"Unzureichender Kontrast zwischen Text und Hintergrundfarbe: Der gelbe Hintergrund mit weißem Text bei den Kategorie-Buttons bietet möglicherweise nicht genügend Kontrast für Nutzer mit Sehbehinderungen oder bei hellem Licht."

**Beispiel eines Interaktionsproblems:**

"Fehlendes visuelles Feedback beim Button-Druck: Die Kategorie-Buttons scheinen kein visuelles Feedback beim Antippen zu haben, was Nutzer unsicher machen könnte, ob ihre Eingabe registriert wurde."

**Beispiel eines Navigationsproblems:**

"Fehlende klare Navigationshinweise: Es gibt keine klare Anzeige, wie nach einer Auswahl zur nächsten Frage fortgefahren werden kann, was zu Nutzerverwirrung führen könnte."

**Beispiel eines Barrierefreiheitsproblems:**

"Unzureichende Touch-Targets: Der Button könnte eine unzureichende Touch-Target-Größe haben, was es für Nutzer schwierig machen könnte, präzise zu tippen, besonders auf kleineren Bildschirmen."

**Beispiel eines Verständlichkeitsproblems:**

"Mehrdeutige Fortschrittsanzeige: Die Fortschrittsleiste hat keine Beschriftung oder Anzeige dessen, was sie repräsentiert, was zu Verwirrung über den Nutzerfortschritt führen könnte."
</examples>`
    }
    
    return `<examples>
**Example of a valid usability problem (based on UX-LLM research):**

"Insufficient contrast between text and background color: The yellow background with white text on the category buttons may not provide enough contrast for users with visual impairments or when viewing in bright light conditions."

**Example of an interaction problem:**

"No visual feedback on button press: The category buttons do not appear to have any visual feedback when tapped, which could leave users uncertain whether their input has been registered."

**Example of a navigation problem:**

"Lack of clear navigation cues: There is no clear indication of how to proceed to the next question after a selection is made, which could lead to user confusion."

**Example of an accessibility problem:**

"Inadequate touch targets: The button may have an inadequate touch target size, which could make it difficult for users to tap accurately, especially on devices with smaller screens."

**Example of a comprehensibility problem:**

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
   * A/B/C Testing Utility für einfache Prompt-Varianten-Auswahl
   * Bietet eine einfache Schnittstelle für das Testen aller drei Varianten
   * 
   * @param appContext - App-Kontext für die Analyse
   * @param variant - Welche Variante verwendet werden soll
   * @param includeExamples - Ob Beispiele inkludiert werden sollen
   * @param customPrompt - Optionale benutzerdefinierte Zusatzanweisungen
   * @returns Strukturierter Prompt für die gewählte Variante
   */
  static createABCTestPrompt(
    appContext: AppContext,
    variant: PromptVariant = 'advanced',
    includeExamples: boolean = false,
    customPrompt?: string,
    language: 'de' | 'en' = 'de'
  ): string {
    return this.createUsabilityPrompt(appContext, includeExamples, customPrompt, variant, language)
  }

  /**
   * Legacy A/B Testing Utility - behält Kompatibilität bei
   */
  static createABTestPrompt(
    appContext: AppContext,
    testPure: boolean = false,
    includeExamples: boolean = false,
    customPrompt?: string
  ): string {
    const variant: PromptVariant = testPure ? 'basic' : 'advanced'
    return this.createUsabilityPrompt(appContext, includeExamples, customPrompt, variant)
  }

  /**
   * Erstellt alle drei Prompt-Varianten für direkten Vergleich
   * Nützlich für die wissenschaftliche Auswertung und Dokumentation
   * 
   * @param appContext - App-Kontext für die Analyse
   * @param includeExamples - Ob Beispiele inkludiert werden sollen
   * @param customPrompt - Optionale benutzerdefinierte Zusatzanweisungen
   * @returns Objekt mit allen drei Prompt-Varianten
   */
  static createAllVariants(
    appContext: AppContext,
    includeExamples: boolean = false,
    customPrompt?: string
  ): { studyPure: string; basic: string; advanced: string } {
    return {
      studyPure: this.createUsabilityPrompt(appContext, includeExamples, customPrompt, 'study-pure'),
      basic: this.createUsabilityPrompt(appContext, includeExamples, customPrompt, 'basic'),
      advanced: this.createUsabilityPrompt(appContext, includeExamples, customPrompt, 'advanced')
    }
  }

  /**
   * Legacy-Kompatibilität: Erstellt beide ursprüngliche Varianten
   */
  static createBothVariants(
    appContext: AppContext,
    includeExamples: boolean = false,
    customPrompt?: string
  ): { basic: string; advanced: string } {
    return {
      basic: this.createUsabilityPrompt(appContext, includeExamples, customPrompt, 'basic'),
      advanced: this.createUsabilityPrompt(appContext, includeExamples, customPrompt, 'advanced')
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
