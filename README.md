# UXScope - LLM-basierte Usability-Analyse

**Eine Untersuchung der Fähigkeiten von Large Language Models (LLMs) zur automatisierten Erkennung und Bewertung von Usability in digitalen Anwendungen**

## Projektbeschreibung

UXScope ist eine webbasierte Anwendung zur automatisierten Usability-Bewertung digitaler Anwendungen durch Large Language Models. Das Tool wurde im Rahmen einer Bachelorarbeit entwickelt und ermöglicht es, Screenshots von Benutzeroberflächen hochzuladen und durch verschiedene LLMs (GPT-4o, Claude 3.5, Grok 4 Vision) analysieren zu lassen.

### Wissenschaftlicher Hintergrund

Diese Anwendung ist Teil der Bachelorarbeit mit dem Titel **"Eine Untersuchung der Fähigkeiten von Large Language Models (LLMs) zur automatisierten Erkennung und Bewertung von Usability in digitalen Anwendungen"**. Die Arbeit untersucht, inwieweit moderne LLMs als Alternative oder Ergänzung zu traditionellen Usability-Testing-Methoden eingesetzt werden können.

### Zielstellung

Das Projekt verfolgt mehrere wissenschaftliche und praktische Ziele:

- **Evaluierung verschiedener LLM-Modelle** hinsichtlich ihrer Fähigkeit zur Usability-Bewertung
- **Vergleich unterschiedlicher Prompt-Engineering-Ansätze** basierend auf wissenschaftlicher Literatur
- **Entwicklung einer standardisierten Bewertungsmethodik** für LLM-basierte Usability-Analysen
- **Praktische Anwendbarkeit** für UX-Professionals und Entwickler

## Funktionsumfang

### Kernfunktionen

- **Screenshot-Upload**: Laden Sie Screenshots Ihrer Anwendung hoch
- **Multi-LLM-Support**: Unterstützung für verschiedene Large Language Models:
  - OpenAI GPT-4o und GPT-4o Mini
  - Anthropic Claude 3.5 Sonnet, Claude 3 Opus/Sonnet/Haiku
  - xAI Grok 4 Vision
  - Meta Llama 3.2 Vision (über Together AI)
- **Kontext-Management**: Detaillierte Beschreibung der Anwendung und Benutzeraufgaben
- **Prompt-Varianten**: Drei wissenschaftlich fundierte Analyse-Ansätze
- **Mehrsprachigkeit**: Deutsche und englische Prompt-Unterstützung
- **Analyse-Historie**: Speicherung und Verwaltung durchgeführter Analysen

### Wissenschaftliche Features

- **A/B/C-Testing verschiedener Prompt-Strategien**:
  - **Study-Pure**: Originale IEEE-Studie Replikation
  - **Basic**: Minimalistischer Ansatz
  - **Advanced**: Detaillierte wissenschaftliche Analyse
- **Kategorisierte Problemerkennung**: Systematische Klassifizierung von Usability-Problemen
- **Vergleichende Evaluation**: Bewertung verschiedener LLM-Ansätze
- **Methodologie-Dokumentation**: Transparente Darstellung der verwendeten Methoden

## Bedienung

### Erste Schritte

1. **Profil erstellen**: Wählen Sie ein LLM-Modell und geben Sie Ihren API-Key ein
2. **Screenshot hochladen**: Laden Sie einen Screenshot Ihrer zu analysierenden Anwendung hoch
3. **Kontext beschreiben**: Geben Sie Details zur Anwendung und der Benutzeraufgabe ein
4. **Analyse starten**: Klicken Sie auf "Usability analysieren"

### Erweiterte Einstellungen

- **Prompt-Variante wählen**: Experimentieren Sie mit verschiedenen Analyse-Ansätzen
  - **Study-Pure**: IEEE-Studie Replikation mit Technologie-Modi
  - **Basic**: Minimalistischer, offener Ansatz
  - **Advanced**: Umfassende wissenschaftliche Analyse

- **UI-Modus (nur Study-Pure)**: 
  - **SwiftUI-Only**: Originalgetreue IEEE-Studie für iOS/SwiftUI-Apps
  - **Generalisiert**: Technologie-unabhängige Adaption für React, Flutter, HTML/CSS, etc.

- **Sprache**: Stellen Sie die Prompt-Sprache auf Deutsch oder Englisch
- **Custom Prompts**: Fügen Sie spezifische Anforderungen hinzu

**Hinweis zum UI-Modus**: Der UI-Modus ist nur bei der Study-Pure Variante verfügbar und ermöglicht es, die IEEE-Methodik entweder originalgetreu (SwiftUI-Only) oder technologie-unabhängig (Generalisiert) anzuwenden.

### Navigation

Die Anwendung ist in mehrere Bereiche unterteilt:

- **Analyse**: Hauptbereich für die Durchführung von Usability-Analysen
- **Evaluation**: Wissenschaftliche Bewertung und Vergleich verschiedener LLMs
- **Alternative Evaluation**: Qualitative Bewertungsansätze
- **Methodik**: Dokumentation der verwendeten wissenschaftlichen Methoden
- **Kritische Reflexion**: Diskussion von Limitationen und Herausforderungen
- **Historie**: Übersicht über durchgeführte Analysen

## Technische Details

### Technologie-Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS mit Dark Mode Support
- **API-Integration**: Native SDKs für OpenAI, Anthropic, xAI
- **Datenspeicherung**: Lokaler Browser-Storage
- **Icons**: Lucide React

### API-Unterstützung

Das Tool unterstützt folgende APIs:
- OpenAI API (GPT-4o, GPT-4o Mini)
- Anthropic API (Claude 3.5, Claude 3 Familie)
- xAI API (Grok 4 Vision)
- Together AI (Llama 3.2 Vision)

### Systemanforderungen

- Moderne Webbrowser (Chrome, Firefox, Safari, Edge)
- Internetverbindung für API-Aufrufe
- Node.js 18+ für lokale Entwicklung

## Installation und Setup

### Lokale Entwicklung

1. **Repository klonen**:
   ```bash
   git clone https://github.com/nichtkarim/Bachelorprojekt.git
   cd Bachelorprojekt
   ```

2. **Dependencies installieren**:
   ```bash
   npm install
   ```

3. **Entwicklungsserver starten**:
   ```bash
   npm run dev
   ```

4. **Browser öffnen**: Navigieren Sie zu `http://localhost:3000`

### API-Keys einrichten

Um die Anwendung zu nutzen, benötigen Sie API-Keys von den entsprechenden Anbietern:

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **xAI**: https://console.x.ai/
- **Together AI**: https://api.together.xyz/settings/api-keys

Geben Sie die API-Keys direkt in der Anwendung beim Erstellen eines Profils ein.

## Live-Demo

Eine funktionsfähige Version der Anwendung ist verfügbar unter:

**[UXScope Live-Demo](https://ux-scope.vercel.app/)**

*Hinweis: Für die Live-Demo benötigen Sie eigene API-Keys der jeweiligen Anbieter.*

## Wissenschaftliche Grundlagen

### Basis-Literatur und IEEE-Studie

Die methodische Grundlage dieser Arbeit bildet primär die IEEE-Studie **"Does GenAI Make Usability Testing Obsolete?"** (ICSE 2025, IEEE Computer Society Digital Library: 056900a675), die als erste systematische Untersuchung zur Anwendung von Large Language Models in der Usability-Evaluation gilt. Diese Studie untersuchte die Fähigkeit von GPT-4 zur Identifikation von Usability-Problemen in SwiftUI-Anwendungen und etablierte eine Baseline für LLM-basierte UX-Bewertungen.

**Zentrale Erkenntnisse der Originalstudie:**
- GPT-4 kann systematisch Usability-Probleme identifizieren
- Bestimmte Problemkategorien werden besser erkannt als andere
- Prompt-Design hat erheblichen Einfluss auf die Ergebnisqualität
- Vision-Capabilities verbessern die Analyse signifikant

**Erweiterung in dieser Arbeit:**
- Vergleich zwischen verschiedenen LLM-Architekturen (nicht nur GPT-4)
- Systematische Evaluation von Prompt-Engineering-Strategien
- Deutsche Adaption für erweiterte Anwendbarkeit
- Integration weiterer wissenschaftlicher Ansätze aus der UX-LLM-Forschung

Zusätzlich fließen Erkenntnisse aus der UX-LLM-Studie (IEEE Xplore: 11029918) ein, die sich mit strukturierten Prompt-Engineering-Ansätzen für UX-Bewertungen beschäftigt und methodische Grundlagen für die Basic- und Advanced-Varianten liefert.

### Methodologie und Heuristiken

#### Nielsen's Usability-Heuristiken

Die Anwendung integriert Jakob Nielsen's etablierte Usability-Heuristiken, jedoch **nicht als starre Vorgabe, sondern als flexible Bewertungsgrundlage**:

1. **Sichtbarkeit des Systemstatus**
2. **Übereinstimmung zwischen System und realer Welt**
3. **Nutzerkontrolle und -freiheit**
4. **Konsistenz und Standards**
5. **Fehlervermeidung**
6. **Wiedererkennung statt Erinnerung**
7. **Flexibilität und Effizienz der Nutzung**
8. **Ästhetisches und minimalistisches Design**
9. **Hilfe bei der Erkennung, Diagnose und Behebung von Fehlern**
10. **Hilfe und Dokumentation**

#### Adaptive Heuristik-Anwendung

**Wichtiger Hinweis**: Die Heuristiken werden **nicht bei allen Prompt-Varianten explizit vorgegeben**. Stattdessen nutzt UXScope einen differenzierten Ansatz:

- **Study-Pure Variante**: Verzichtet bewusst auf explizite Heuristik-Nennung, um die Originalstudie zu replizieren und zu prüfen, ob LLMs diese Prinzipien implizit anwenden
- **Basic Variante**: Minimalistischer Ansatz ohne strukturelle Vorgaben, ermöglicht freie Problemidentifikation
- **Advanced Variante**: Subtile Integration der Heuristiken als Bewertungsrahmen, ohne diese explizit zu benennen

Dieser Ansatz ermöglicht es zu untersuchen, ob und wie LLMs etablierte UX-Prinzipien eigenständig erkennen und anwenden.

### Prompt Engineering

Die Anwendung implementiert drei wissenschaftlich fundierte Prompt-Strategien:

#### 1. Study-Pure (IEEE-Replikation)
- **Basis**: Direkte Replikation der in der IEEE-Studie "Does GenAI Make Usability Testing Obsolete?" (ICSE 2025) verwendeten Prompts
- **Ziel**: Reproduzierbare Ergebnisse und Vergleichbarkeit mit publizierten Forschungsergebnissen
- **Charakteristika**: 
  - Originalgetreue Prompt-Struktur aus der ICSE-Studie
  - Keine explizite Heuristik-Vorgabe
  - Minimal-invasiver Ansatz
  - Verfügbar in deutscher Übersetzung für erweiterte Anwendbarkeit

**Technologie-Flexibilität der Study-Pure Variante:**

Die ursprüngliche IEEE-Studie fokussierte sich ausschließlich auf SwiftUI-Anwendungen. UXScope erweitert diesen Ansatz durch zwei Modi:

- **SwiftUI-Only Modus**: Exakte Replikation der Originalstudie
  - Prompts referenzieren explizit SwiftUI und iOS
  - Direkte Vergleichbarkeit mit den ICSE-Ergebnissen
  - Methodisch konsistent für wissenschaftliche Validierung

- **Generalisierter Modus**: Technologie-unabhängige Adaption
  - Prompts verwenden allgemeine UI-Terminologie
  - Anwendbar auf React, Flutter, HTML/CSS, etc.
  - Erweitert die Anwendbarkeit der IEEE-Methodik
  - Ermöglicht Cross-Platform-Usability-Bewertungen

Diese Flexibilität erlaubt es, die bewährte IEEE-Methodik auf moderne Multi-Platform-Entwicklung anzuwenden, während die wissenschaftliche Integrität der Originalstudie gewahrt bleibt.

#### 2. Basic (UX-LLM-Studie adaptiert)
- **Basis**: Adaptierte Erkenntnisse aus der UX-LLM-Studie (IEEE Xplore: 11029918)
- **Ziel**: Effiziente Problemidentifikation mit minimalen strukturellen Vorgaben
- **Charakteristika**:
  - Offene Problemidentifikation
  - Kategorisierte Schweregrad-Bewertung
  - Kurze, prägnante Instruktionen
  - Nutzerorientierte Sprache

#### 3. Advanced (Erweiterte wissenschaftliche Analyse)
- **Basis**: Kombination aus Nielsen-Heuristiken, WCAG-Standards und ISO-Normen
- **Ziel**: Umfassende, strukturierte Usability-Bewertung
- **Charakteristika**:
  - Detaillierte Expertise-Beschreibung
  - Systematische Problemkategorien
  - Wissenschaftliche Analysemethodik
  - Umfassende Qualitätskriterien

### Bewertungskriterien und Standards

#### Integration etablierter Standards

- **WCAG 2.1 Guidelines**: Barrierefreiheits-Standards für inklusive Gestaltung
- **ISO 9241-11**: Internationale Standards für Benutzerfreundlichkeit
- **ISO 9241-210**: Human-centered Design-Prozesse
- **DIN EN ISO 14915**: Multimedia-Benutzerschnittstellen

#### Systematische Problemklassifizierung

UXScope verwendet ein fünfstufiges Bewertungssystem, das auf realen Usability-Test-Ergebnissen basiert:

- **[KATASTROPHAL]**: Existenzielle Bedrohungen (nur nach Management-Rücksprache)
- **[KRITISCH]**: Nutzer brechen ab oder sind sehr unzufrieden
- **[ERNST]**: Erhebliche Verzögerungen oder mäßige Unzufriedenheit  
- **[GERING]**: Spürbare Verzögerungen oder geringe Unzufriedenheit
- **[POSITIV]**: Gut funktionierende Aspekte (wichtig für ausgewogene Bewertung)

### Empirische Validierung

Die Methodik ermöglicht verschiedene Validierungsansätze:

- **Quantitative Metriken**: Precision, Recall, F1-Score bei strukturierten Problemen
- **Qualitative Bewertung**: Inhaltliche Analyse der LLM-Ausgaben
- **Inter-Rater-Reliabilität**: Konsistenz zwischen verschiedenen LLM-Modellen
- **Expert-Validierung**: Abgleich mit traditionellen Usability-Experten

## Limitationen

### Technische Limitationen

- Abhängigkeit von externen API-Services
- Verarbeitung nur von statischen Screenshots
- Keine Interaktionsanalyse möglich
- Begrenzte Kontextinformationen

### Methodische Überlegungen

- LLMs können nicht alle Aspekte traditioneller Usability-Tests ersetzen
- Subjektivität in der Bewertung durch verschiedene Modelle
- Fehlende Nutzerbeobachtung und -feedback
- Kulturelle und sprachliche Verzerrungen möglich

## Beitrag zur Forschung

Diese Arbeit trägt zur aktuellen Forschung bei durch:

- **Systematische Evaluation** verschiedener LLM-Modelle für UX-Aufgaben
- **Standardisierte Methodik** für LLM-basierte Usability-Bewertung
- **Praktische Anwendung** wissenschaftlicher Erkenntnisse
- **Open-Source-Bereitstellung** für weitere Forschung

## Lizenz

Dieses Projekt ist für akademische und Forschungszwecke entwickelt worden. Die Verwendung für kommerzielle Zwecke bedarf einer separaten Vereinbarung.

## Kontakt

Für Fragen zur wissenschaftlichen Arbeit oder technischen Implementierung stehe ich gerne zur Verfügung.

---

*Entwickelt im Rahmen der Bachelorarbeit zur Untersuchung von Large Language Models in der Usability-Evaluation.*
