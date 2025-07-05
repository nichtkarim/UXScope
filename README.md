# Usability Tester

Eine moderne Webanwendung für Usability-Tests mit LLM-Integration, entwickelt nach ISO-Standards für menschenzentrierte Gestaltung.

## 🚀 Features

### Kernfunktionen
- **Screenshot-Upload**: Drag & Drop Interface für Bilduploads
- **Profilverwaltung**: Erstellen und verwalten von Benutzerprofilen
- **LLM-Integration**: Auswahl zwischen Llama 3, Claude 4, GPT-4o und GPT-4.5
- **Umfassende Analyse**: Bewertung nach Nielsen's Heuristiken und ISO-Standards

### Analyse-Kriterien
- **Nielsen's 10 Usability-Heuristiken**
- **ISO 9241-11 Standards** (Effektivität, Effizienz, Zufriedenstellung)
- **WCAG 2.1 Barrierefreiheit**
- **Dialogprinzipien der menschenzentrierten Gestaltung**

## 🛠️ Technologie-Stack

- **Framework**: Next.js 15 mit App Router
- **Sprache**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File Upload**: React Dropzone
- **UI Components**: Headless UI

## 📋 Voraussetzungen

- Node.js 18+ 
- npm oder yarn

## 🔧 Installation

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd usability-tester
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

3. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

4. **Anwendung öffnen**
   - Öffnen Sie [http://localhost:3001](http://localhost:3001) in Ihrem Browser

## 📝 Verfügbare Scripts

- `npm run dev` - Startet den Entwicklungsserver
- `npm run build` - Erstellt eine Production-Version
- `npm run start` - Startet den Production-Server
- `npm run lint` - Führt ESLint aus

## 🎯 Verwendung

### 1. Profil erstellen
- Wählen Sie "Neues Profil erstellen"
- Geben Sie Name, E-Mail und bevorzugtes LLM ein
- Speichern Sie das Profil

### 2. Screenshot hochladen
- Ziehen Sie einen Screenshot in den Upload-Bereich
- Oder klicken Sie zum Dateiauswahl
- Unterstützte Formate: JPEG, PNG, GIF, WebP (max. 10MB)

### 3. Kontext eingeben
- **Beschreibung**: Erklären Sie den Kontext der Anwendung
- **UI-Code**: Fügen Sie relevanten Code hinzu (optional)

### 4. Analyse starten
- Klicken Sie auf "Usability analysieren"
- Warten Sie auf die LLM-Antwort
- Überprüfen Sie die detaillierten Ergebnisse

## 📊 Analyse-Ergebnisse

Die Anwendung liefert strukturierte Bewertungen basierend auf:

### Nielsen's Heuristiken
1. Sichtbarkeit des Systemstatus
2. Übereinstimmung zwischen System und realer Welt
3. Benutzerkontrolle und Freiheit
4. Konsistenz und Standards
5. Fehlervermeidung
6. Wiedererkennung statt Erinnerung
7. Flexibilität und Effizienz der Nutzung
8. Ästhetisches und minimalistisches Design
9. Hilfe bei der Erkennung, Diagnose und Behebung von Fehlern
10. Hilfe und Dokumentation

### ISO-Standards
- **Effektivität**: Können Benutzer ihre Ziele erreichen?
- **Effizienz**: Wie schnell und mit welchem Aufwand?
- **Zufriedenheit**: Wie zufrieden sind die Benutzer?

### Barrierefreiheit
- WCAG 2.1 Compliance
- Farbkontrast-Analyse
- Tastaturnavigation
- Screenreader-Kompatibilität

## 🔮 Geplante Features

- [ ] Export von Analyse-Berichten (PDF, JSON)
- [ ] Historische Analyse-Vergleiche
- [ ] Team-Kollaboration
- [ ] Erweiterte LLM-Konfiguration
- [ ] Automatische Screenshot-Annotation
- [ ] Integration mit Design-Tools (Figma, Sketch)

## 🤝 Beitragen

1. Fork das Repository
2. Erstellen Sie einen Feature Branch (`git checkout -b feature/amazing-feature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffnen Sie einen Pull Request

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Details finden Sie in der [LICENSE](LICENSE) Datei.

## 📞 Support

Bei Fragen oder Problemen:
- Öffnen Sie ein [Issue](https://github.com/your-repo/usability-tester/issues)
- Kontaktieren Sie das Entwicklungsteam

---

**Entwickelt mit ❤️ für bessere User Experience**
