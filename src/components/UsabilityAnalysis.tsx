'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Loader2, CheckCircle, AlertCircle, XCircle, User, Star, Clock, Target, BookOpen, Eye, Shield, Zap, Palette, HelpCircle, Download, RefreshCw, TrendingUp, Award, FileText, Skull, ChevronDown } from 'lucide-react'
import { PromptVariant } from '@/lib/promptEngineering'
import { exportMeasurableData } from '@/lib/exportMeasurableData'
import { exportToExcel } from '@/lib/excelExport'
import { ProjectManagerModal } from './ProjectManagerModal'
import { AddToProjectModal } from './AddToProjectModal'
import { MultiLLMAnalyzer, MultiLLMAnalysisRequest } from '@/lib/multiLLMAnalysis'
import { MultiLLMModal } from './MultiLLMModal'

interface UsabilityAnalysisProps {
  analysis: string | null
  isAnalyzing: boolean
  onReset?: () => void
  promptVariant?: PromptVariant
  promptUsed?: string
  // Add structured findings from API
  findings?: Array<{
    category: string;
    text: string;
  }>
  metadata?: {
    llmModel: string
    llmName: string
    analysisTime: string
    processingTimeMs: number
    supportsVision: boolean
    imageProvided: boolean
    contextProvided: boolean
    promptVariant: string
    userProfile: {
      name: string
      email: string
    }
  }
  // Add context data and language for export
  contextData?: {
    description: string
    userTask: string
    uiCode?: string
    customPrompt?: string
    promptVariant: PromptVariant
    uiMode: string
  }
  promptLanguage?: 'de' | 'en'
}

interface ParsedSection {
  type: string
  title: string
  content: string[]
  severity: string
  textPosition?: number
}

export default function UsabilityAnalysis({ 
  analysis, 
  isAnalyzing, 
  onReset, 
  promptVariant = 'advanced', 
  promptUsed, 
  findings, 
  metadata, 
  contextData, 
  promptLanguage = 'de' 
}: UsabilityAnalysisProps) {
  
  // Bestimme die tatsächliche Prompt-Variante (Vorrang: Metadata)
  const variant = metadata?.promptVariant ?? promptVariant
  // State für Highlighting und Scrolling zu bestimmten Bereichen
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null)
  
  // State for prompt details dropdown
  const [showPromptDetails, setShowPromptDetails] = useState(false)
  
  // State for export dropdown
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  
  // State for JavaScript-based tooltips
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  
  // State for Project Management Modals
  const [showProjectManager, setShowProjectManager] = useState(false)
  const [showAddToProject, setShowAddToProject] = useState(false)
  
  // State for Multi-LLM Analysis
  const [showMultiLLMModal, setShowMultiLLMModal] = useState(false)
  const [multiLLMRunning, setMultiLLMRunning] = useState(false)
  const [multiLLMResults, setMultiLLMResults] = useState<any>(null)
  
  // Helper function to prepare current analysis data for project storage
  const prepareAnalysisDataForProject = () => {
    if (!analysis || !metadata) return null;
    
    // Convert current analysis to ExcelExportData format
    const now = new Date();
    const exportId = `UXS_${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    
    // Process befunde from parsed sections
    const befunde = parsedSections
      .filter(section => section.type !== 'summary')
      .map((section, index) => ({
        befundId: `${exportId}_B${(index + 1).toString().padStart(3, '0')}`,
        kategorie: promptVariant === 'study-pure' ? 'Befund' : section.type,
        schweregrad: promptVariant === 'study-pure' ? 'Nicht bewertet' : section.severity,
        titel: promptVariant === 'study-pure' ? `Befund ${index + 1}` : section.title,
        beschreibung: section.content[0] || '',
        position: section.textPosition || -1
      }));
    
    return {
      titel: `Usability-Analyse ${promptVariant?.toUpperCase() || 'UNKNOWN'}`,
      datum: now.toLocaleDateString('de-DE'),
      zeit: now.toLocaleTimeString('de-DE'),
      exportId: exportId,
      promptVariante: promptVariant === 'study-pure' ? 'Study-Pure (A)' : 
                     promptVariant === 'basic' ? 'Basic (B)' : 'Advanced (C)',
      promptSprache: promptLanguage === 'de' ? 'Deutsch' : 'English',
      llmModell: `${metadata.llmName || 'Unbekannt'} (${metadata.llmModel || 'Unbekannt'})`,
      
      appOverview: contextData?.description || 'Keine Beschreibung verfügbar',
      eingegebenerCode: contextData?.uiCode || 'Kein Code eingegeben',
      benutzerAufgabe: contextData?.userTask || 'Keine Aufgabe definiert',
      
      befunde: befunde,
      vollstaendigeAnalyse: analysis,
      
      verarbeitungszeit: metadata.processingTimeMs || 0,
      bildVorhanden: metadata.imageProvided || false,
      kontextVorhanden: metadata.contextProvided || false,
      visionUnterstuetzt: metadata.supportsVision || false
    };
  };

  const handleTooltipShow = (tooltipId: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
    
    setTooltipPosition({
      x: rect.left + scrollLeft + rect.width / 2,
      y: rect.top + scrollTop - 10
    })
    setActiveTooltip(tooltipId)
  }

  const handleTooltipHide = () => {
    setActiveTooltip(null)
  }
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Prüfe ob der Klick innerhalb des Dropdown-Containers ist
      const isDropdownClick = target.closest('.export-dropdown-container')
      
      if (showExportDropdown && !isDropdownClick) {
        console.log('Closing dropdown due to outside click')
        setShowExportDropdown(false)
      }
    }
    
    if (showExportDropdown) {
      // Verzögerung hinzufügen, damit der Button-Click zuerst verarbeitet wird
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportDropdown])
  
  // Funktion zum Parsen von STUDY-PURE Befunden
  const parseStudyPureFindings = (text: string): string[] => {
    if (!text) return []
    
    // Teile den Text in logische Absätze auf
    let findings = text
      .split(/\n\s*\n|\r\n\s*\r\n/) // Split by double line breaks
      .filter(paragraph => paragraph.trim().length > 20) // Filter out very short paragraphs
      .map(paragraph => paragraph.trim())
    
    // Falls keine natürlichen Absätze vorhanden sind, versuche andere Methoden
    if (findings.length <= 1) {
      // Versuche aufgrund von Satzzeichen zu trennen
      const sentences = text.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])/)
      const groupedSentences: string[] = []
      let currentGroup = ""
      
      sentences.forEach((sentence, index) => {
        const isNewFindingStart = sentence.match(/^(Das\s|Die\s|Der\s|Ein\s|Eine\s|Es\s|Problem|Nutzer|Benutzer|Button|Text|Farbe|Layout)/i)
        
        // Starte neue Gruppe wenn wir einen neuen Befund erkennen und die aktuelle Gruppe ausreichend lang ist
        if (isNewFindingStart && currentGroup.length > 60) {
          if (currentGroup.trim()) {
            groupedSentences.push(currentGroup.trim())
            currentGroup = sentence
          }
        } else {
          currentGroup += (currentGroup ? " " : "") + sentence
        }
        
        // Füge die letzte Gruppe hinzu
        if (index === sentences.length - 1 && currentGroup.trim()) {
          groupedSentences.push(currentGroup.trim())
        }
      })
      
      findings = groupedSentences.filter(group => group.length > 20)
    }
    
    // Falls immer noch zu wenige Befunde, verwende den gesamten Text als einen Befund
    if (findings.length === 0 && text.trim().length > 0) {
      findings = [text.trim()]
    }
    
    return findings
  }
  
  const exportReport = () => {
    if (!analysis) return
    
    console.log('Text export function called')
    
    const reportContent = `USABILITY-ANALYSE BERICHT
========================

Datum: ${new Date().toLocaleDateString('de-DE')}
Zeit: ${new Date().toLocaleTimeString('de-DE')}

${analysis}

---
Erstellt mit Usability Tester - LLM-basierte Usability-Evaluation
${variant === 'study-pure'
  ? 'Basierend auf der originalen IEEE-Studie "Does GenAI Make Usability Testing Obsolete?"'
  : variant === 'advanced' 
    ? 'Basierend auf Nielsen\'s Heuristiken, ISO 9241-11 und WCAG 2.1' 
    : 'Basierend auf der UX-LLM Studie (IEEE Xplore: 11029918)'
}`
    
    // Fallback: Zeige Daten in neuem Fenster
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Usability-Analyse-${new Date().toISOString().split('T')[0]}.txt</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                white-space: pre-wrap; 
                padding: 20px; 
                background: #f5f5f5;
                margin: 0;
              }
              .header {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: white;
                border-bottom: 1px solid #ddd;
                padding: 10px 20px;
                z-index: 1000;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .download-btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
              }
              .download-btn:hover {
                background: #0056b3;
              }
              .content {
                margin-top: 60px;
                background: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .copy-btn {
                background: #28a745;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                margin-left: 10px;
              }
              .copy-btn:hover {
                background: #1e7e34;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h3>Usability-Analyse Export</h3>
              <div>
                <button class="download-btn" onclick="downloadFile()">Download als .txt</button>
                <button class="copy-btn" onclick="copyToClipboard()">In Zwischenablage kopieren</button>
              </div>
            </div>
            <div class="content">${reportContent}</div>
            
            <script>
              function downloadFile() {
                try {
                  const content = document.querySelector('.content').textContent;
                  const filename = 'Usability-Analyse-${new Date().toISOString().split('T')[0]}.txt';
                  
                  // Methode 1: Blob + Download
                  const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
                  
                  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    // Internet Explorer
                    window.navigator.msSaveOrOpenBlob(blob, filename);
                  } else {
                    // Moderne Browser
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }, 100);
                  }
                  
                  alert('Download gestartet!');
                } catch (error) {
                  console.error('Download failed:', error);
                  alert('Download fehlgeschlagen. Bitte verwenden Sie "In Zwischenablage kopieren".');
                }
              }
              
              function copyToClipboard() {
                try {
                  const content = document.querySelector('.content').textContent;
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(content).then(() => {
                      alert('Text wurde in die Zwischenablage kopiert!');
                    });
                  } else {
                    // Fallback für ältere Browser
                    const textArea = document.createElement('textarea');
                    textArea.value = content;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('Text wurde in die Zwischenablage kopiert!');
                  }
                } catch (error) {
                  console.error('Copy failed:', error);
                  alert('Kopieren fehlgeschlagen. Bitte markieren Sie den Text manuell und drücken Sie Strg+C.');
                }
              }
            </script>
          </body>
        </html>
      `)
      newWindow.document.close()
      console.log('Text opened in new window with enhanced download functionality')
    } else {
      alert('Popup wurde blockiert. Bitte erlauben Sie Popups für diese Seite oder kopieren Sie den Text aus der Konsole.')
      console.log('Report Content:', reportContent)
    }
  }

  const exportMeasurableDataForAnalysis = () => {
    console.log('Export function called')
    
    if (!analysis) {
      alert('Keine Analyse zum Exportieren verfügbar')
      return
    }

    try {
      console.log('Generating export data...')
      
      // Verwende die bereits berechneten summary-Werte von der Webseite
      const exportData = exportMeasurableData(
        analysis,
        metadata,
        promptUsed || '',
        contextData,
        promptVariant,
        promptLanguage,
        summary // Übergebe die bereits berechneten Werte
      )
      
      const filename = `measurable_analysis_${exportData.meta.llm_model}_${exportData.meta.prompt_variant}_${Date.now()}.json`
      const jsonString = JSON.stringify(exportData, null, 2)
      
      // Fallback: Zeige JSON in neuem Fenster
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${filename}</title>
              <style>
                body { 
                  font-family: 'Courier New', monospace; 
                  padding: 20px; 
                  background: #f5f5f5;
                  margin: 0;
                }
                .header {
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  background: white;
                  border-bottom: 1px solid #ddd;
                  padding: 10px 20px;
                  z-index: 1000;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                }
                .download-btn {
                  background: #28a745;
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 14px;
                }
                .download-btn:hover {
                  background: #1e7e34;
                }
                .copy-btn {
                  background: #17a2b8;
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 14px;
                  margin-left: 10px;
                }
                .copy-btn:hover {
                  background: #138496;
                }
                .content {
                  margin-top: 60px;
                  background: white;
                  padding: 20px;
                  border-radius: 5px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  white-space: pre-wrap;
                  font-size: 12px;
                  overflow-x: auto;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h3>📊 Messbare Daten Export</h3>
                <div>
                  <button class="download-btn" onclick="downloadFile()">Download als .json</button>
                  <button class="copy-btn" onclick="copyToClipboard()">In Zwischenablage kopieren</button>
                </div>
              </div>
              <div class="content">${jsonString}</div>
              
              <script>
                function downloadFile() {
                  try {
                    const content = document.querySelector('.content').textContent;
                    const filename = '${filename}';
                    
                    // Methode 1: Blob + Download
                    const blob = new Blob([content], {type: 'application/json;charset=utf-8'});
                    
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                      // Internet Explorer
                      window.navigator.msSaveOrOpenBlob(blob, filename);
                    } else {
                      // Moderne Browser
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = filename;
                      document.body.appendChild(a);
                      a.click();
                      setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }, 100);
                    }
                    
                    alert('Download gestartet!');
                  } catch (error) {
                    console.error('Download failed:', error);
                    alert('Download fehlgeschlagen. Bitte verwenden Sie "In Zwischenablage kopieren".');
                  }
                }
                
                function copyToClipboard() {
                  try {
                    const content = document.querySelector('.content').textContent;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(content).then(() => {
                        alert('JSON-Daten wurden in die Zwischenablage kopiert!');
                      });
                    } else {
                      // Fallback für ältere Browser
                      const textArea = document.createElement('textarea');
                      textArea.value = content;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      alert('JSON-Daten wurden in die Zwischenablage kopiert!');
                    }
                  } catch (error) {
                    console.error('Copy failed:', error);
                    alert('Kopieren fehlgeschlagen. Bitte markieren Sie den Text manuell und drücken Sie Strg+C.');
                  }
                }
              </script>
            </body>
          </html>
        `)
        newWindow.document.close()
        
        // Erfolgs-Feedback
        const metrics = exportData.measurable_metrics
        alert(`📊 Export bereit!\n\nDaten werden in neuem Fenster angezeigt.\nKlicken Sie auf "Download als .json" um die Datei zu speichern.\n\nMessbare Daten:\n• ${metrics.total_words} Wörter\n• ${metrics.total_problem_mentions} Problem-Erwähnungen\n• ${metrics.recommendation_count} Empfehlungen`)
        console.log('JSON opened in new window with download button')
      } else {
        alert('Popup wurde blockiert. Bitte erlauben Sie Popups für diese Seite oder kopieren Sie die JSON-Daten aus der Konsole.')
        console.log('Export Data:', exportData)
      }
      
    } catch (error) {
      console.error('Error during export:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
      alert(`Fehler beim Export: ${errorMessage}`)
    }
  }

  const exportToExcelForAnalysis = () => {
    console.log('Excel Export function called')
    
    if (!analysis) {
      alert('Keine Analyse zum Exportieren verfügbar')
      return
    }

    try {
      console.log('Generating Excel export...')
      
      // Starte Excel-Export mit allen verfügbaren Daten
      exportToExcel(
        analysis,
        metadata,
        promptUsed || '',
        contextData,
        promptVariant,
        promptLanguage,
        summary,
        parsedSections
      )
      
    } catch (error) {
      console.error('Error during Excel export:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
      alert(`Fehler beim Excel-Export: ${errorMessage}`)
    }
  }

  const handleReset = () => {
    if (onReset) {
      onReset()
    }
  }

  // Function to highlight and scroll to a specific text section
  const highlightTextSection = (section: ParsedSection | string) => {
    let textToHighlight: string
    
    if (typeof section === 'string') {
      textToHighlight = section
    } else if (section.textPosition !== undefined) {
      textToHighlight = section.content[0]
    } else {
      textToHighlight = section.content[0]
    }
    
    if (textToHighlight) {
      setHighlightedSection(textToHighlight)
      // Scroll to the analysis result section
      const analysisElement = document.querySelector('[data-analysis-text]')
      if (analysisElement) {
        analysisElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  // Function to clean text from category tags for display
  const cleanTextForDisplay = (text: string): string => {
    return text
      .replace(/\*\*\[(KATASTROPHAL|KRITISCH|ERNST|GERING|POSITIV)\]\*\*/gi, '')
      .replace(/\[(KATASTROPHAL|KRITISCH|ERNST|GERING|POSITIV)\]/gi, '')
      .replace(/^\s*[\*\-]\s*/gm, '') // Remove leading bullets or asterisks from each line
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Normalize multiple line breaks
      .trim()
  }

  // Function to render text with highlighting and proper paragraph formatting
  const renderTextWithHighlighting = (text: string) => {
    // Clean the text from category tags first
    const cleanedText = cleanTextForDisplay(text)
    
    if (!highlightedSection) {
      // Split text into logical paragraphs/problem blocks instead of individual sentences
      const paragraphs = cleanedText
        .split(/\n\s*\n|\r\n\s*\r\n/) // Split by double line breaks (natural paragraphs)
        .filter(p => p.trim().length > 0)
      
      // If no natural paragraphs found, split by topic indicators
      if (paragraphs.length <= 1) {
        const topicIndicators = [
          /(?=.*(?:problem|fehler|mangel|schwierigkeit))/i,
          /(?=.*(?:positiv|gut|stark|erfolgreich))/i,
          /(?=.*(?:empfehlung|vorschlag|verbesserung))/i,
          /(?=.*(?:heuristik|nielsen|iso|wcag))/i
        ]
        
        // Try to split by sentences that start new topics
        const sentences = cleanedText.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])/)
        const groupedSentences: string[] = []
        let currentGroup = ""
        
        sentences.forEach((sentence, index) => {
          const isNewTopic = topicIndicators.some(indicator => 
            indicator.test(sentence)
          ) && currentGroup.length > 100 // Only start new group if current one has content
          
          if (isNewTopic && currentGroup.trim()) {
            groupedSentences.push(currentGroup.trim())
            currentGroup = sentence
          } else {
            currentGroup += (currentGroup ? " " : "") + sentence
          }
          
          // Push the last group
          if (index === sentences.length - 1 && currentGroup.trim()) {
            groupedSentences.push(currentGroup.trim())
          }
        })
        
        return (
          <div className="space-y-4">
            {groupedSentences.map((paragraph, index) => (
              <p key={index} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        )
      }
      
      return (
        <div className="space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      )
    }
    
    // Original highlighting logic when a section is highlighted
    const cleanedHighlightedSection = cleanTextForDisplay(highlightedSection)
    const parts = cleanedText.split(cleanedHighlightedSection)
    if (parts.length === 1) {
      // No highlighting needed, still format with logical paragraphs
      const paragraphs = cleanedText
        .split(/\n\s*\n|\r\n\s*\r\n/)
        .filter(p => p.trim().length > 0)
      
      if (paragraphs.length <= 1) {
        // Fallback to sentence grouping
        const sentences = cleanedText.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])/)
        const groupedSentences: string[] = []
        let currentGroup = ""
        
        sentences.forEach((sentence, index) => {
          if (currentGroup.length > 150 && sentence.match(/^(Das|Die|Der|Ein|Eine|Es|Problem|Positiv|Empfehlung)/)) {
            if (currentGroup.trim()) {
              groupedSentences.push(currentGroup.trim())
              currentGroup = sentence
            }
          } else {
            currentGroup += (currentGroup ? " " : "") + sentence
          }
          
          if (index === sentences.length - 1 && currentGroup.trim()) {
            groupedSentences.push(currentGroup.trim())
          }
        })
        
        return (
          <div className="space-y-4">
            {groupedSentences.map((paragraph, index) => (
              <p key={index} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        )
      }
      
      return (
        <div className="space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      )
    }
    
    return (
      <div className="space-y-4">
        {parts.map((part, index) => (
          <span key={index}>
            {part && (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed inline">
                {part}
              </p>
            )}
            {index < parts.length - 1 && (
              <span className="bg-yellow-200 dark:bg-yellow-800 px-1 py-0.5 rounded font-medium animate-pulse">
                {cleanedHighlightedSection}
              </span>
            )}
          </span>
        ))}
      </div>
    )
  }
  // Enhanced parsing function that categorizes EVERY finding in the text as problem blocks
  const parseAnalysis = (text: string): ParsedSection[] => {
    const sections: ParsedSection[] = []
    
    // First, always create a main section with the full text
    sections.push({
      type: 'summary',
      title: 'Analyse-Ergebnis',
      content: [text],
      severity: 'info'
    })
    
    // If we have structured findings from the API, use those instead of parsing text
    if (findings && findings.length > 0) {
      
      const mapApiCategoryToSeverity = (category: string): string => {
        const categoryUpper = category.toUpperCase();
        if (categoryUpper === 'KATASTROPHAL' || categoryUpper === 'CATASTROPHIC') return 'catastrophic';
        if (categoryUpper === 'KRITISCH' || categoryUpper === 'CRITICAL') return 'critical';
        if (categoryUpper === 'ERNST' || categoryUpper === 'SERIOUS') return 'serious';
        if (categoryUpper === 'GERING' || categoryUpper === 'MINOR') return 'minor';
        if (categoryUpper === 'POSITIV' || categoryUpper === 'POSITIVE') return 'positive';
        return 'minor'; // Default
      }
      
      const categoryNames = {
        catastrophic: 'Katastrophales Problem',
        critical: 'Kritisches Problem',
        serious: 'Ernstes Problem',
        minor: 'Geringes Problem',
        positive: 'Positiver Befund'
      }
      
      // Group findings by severity first
      const findingsBySeverity = {
        positive: [] as typeof findings,
        catastrophic: [] as typeof findings,
        critical: [] as typeof findings,
        serious: [] as typeof findings,
        minor: [] as typeof findings
      }
      
      findings.forEach((finding) => {
        const severity = mapApiCategoryToSeverity(finding.category)
        findingsBySeverity[severity as keyof typeof findingsBySeverity].push(finding)
      })
      
      // Add sections in desired order: positive, catastrophic, critical, serious, minor
      const orderedSeverities = ['positive', 'catastrophic', 'critical', 'serious', 'minor'] as const
      
      orderedSeverities.forEach(severity => {
        const severityFindings = findingsBySeverity[severity]
        severityFindings.forEach((finding, index) => {
          sections.push({
            type: severity,
            title: `${categoryNames[severity]} ${index + 1}`,
            content: [finding.text],
            severity: severity,
            textPosition: text.indexOf(finding.text)
          })
        })
      })
      
      return sections
    }
    
    const problemBlocks = text
      .split(/\n\s*\n|\r\n\s*\r\n/) // Split by double line breaks first
      .filter(block => block.trim().length > 20)
    
    // If no natural paragraphs, try to identify problem blocks by topic changes
    let finalBlocks: string[] = []
    
    if (problemBlocks.length <= 1) {
      // Split by sentences and group them into logical blocks
      const sentences = text.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])/)
      let currentBlock = ""
      
      sentences.forEach((sentence, index) => {
        const isNewProblemStart = sentence.match(/^(Das\s|Die\s|Der\s|Ein\s|Eine\s|Problem|Positiv|Empfehlung|Außerdem|Zusätzlich|Weiterhin|Jedoch|Allerdings)/i)
        
        // Start new block if we detect a new topic and current block has sufficient content
        if (isNewProblemStart && currentBlock.length > 80) {
          finalBlocks.push(currentBlock.trim())
          currentBlock = sentence
        } else {
          currentBlock += (currentBlock ? " " : "") + sentence
        }
        
        // Add the last block
        if (index === sentences.length - 1 && currentBlock.trim()) {
          finalBlocks.push(currentBlock.trim())
        }
      })
    } else {
      finalBlocks = problemBlocks
    }
    
    // Function to categorize a problem block based on LLM-assigned categories
    const categorizeBlock = (block: string): { severity: string; type: string; confidence: number } => {
      const upperBlock = block.toUpperCase()
      
      // Look for explicit LLM-assigned categories in the text (German)
      if (upperBlock.includes('**[KATASTROPHAL]**') || upperBlock.includes('[KATASTROPHAL]')) {
        return { severity: 'catastrophic', type: 'catastrophic', confidence: 10 }
      }
      if (upperBlock.includes('**[KRITISCH]**') || upperBlock.includes('[KRITISCH]')) {
        return { severity: 'critical', type: 'critical', confidence: 10 }
      }
      if (upperBlock.includes('**[ERNST]**') || upperBlock.includes('[ERNST]')) {
        return { severity: 'serious', type: 'serious', confidence: 10 }
      }
      if (upperBlock.includes('**[GERING]**') || upperBlock.includes('[GERING]')) {
        return { severity: 'minor', type: 'minor', confidence: 10 }
      }
      if (upperBlock.includes('**[POSITIV]**') || upperBlock.includes('[POSITIV]')) {
        return { severity: 'positive', type: 'positive', confidence: 10 }
      }
      
      // Look for explicit LLM-assigned categories in the text (English)
      if (upperBlock.includes('**[CATASTROPHIC]**') || upperBlock.includes('[CATASTROPHIC]')) {
        return { severity: 'catastrophic', type: 'catastrophic', confidence: 10 }
      }
      if (upperBlock.includes('**[CRITICAL]**') || upperBlock.includes('[CRITICAL]')) {
        return { severity: 'critical', type: 'critical', confidence: 10 }
      }
      if (upperBlock.includes('**[SERIOUS]**') || upperBlock.includes('[SERIOUS]')) {
        return { severity: 'serious', type: 'serious', confidence: 10 }
      }
      if (upperBlock.includes('**[MINOR]**') || upperBlock.includes('[MINOR]')) {
        return { severity: 'minor', type: 'minor', confidence: 10 }
      }
      if (upperBlock.includes('**[POSITIVE]**') || upperBlock.includes('[POSITIVE]')) {
        return { severity: 'positive', type: 'positive', confidence: 10 }
      }
      
      // Fallback: If no explicit category found, default to minor
      return { severity: 'minor', type: 'minor', confidence: 1 }
    }
    
    // Categorize each problem block
    const categorizedFindings = finalBlocks.map((block, index) => {
      const category = categorizeBlock(block)
      
      // Remove category tags from the displayed text and clean up formatting
      const cleanBlock = block
        .replace(/\*\*\[(KATASTROPHAL|KRITISCH|ERNST|GERING|POSITIV|CATASTROPHIC|CRITICAL|SERIOUS|MINOR|POSITIVE)\]\*\*/gi, '')
        .replace(/\[(KATASTROPHAL|KRITISCH|ERNST|GERING|POSITIV|CATASTROPHIC|CRITICAL|SERIOUS|MINOR|POSITIVE)\]/gi, '')
        .replace(/^\s*[\*\-]\s*/, '') // Remove leading bullets or asterisks
        .replace(/^\s+|\s+$/g, '') // Trim whitespace
        .replace(/\s+/g, ' ') // Normalize multiple spaces
      
      return {
        block: cleanBlock,
        category: category.severity,
        type: category.type,
        index,
        startIndex: text.indexOf(block)
      }
    })
    
    // Group findings by category
    const findingsByCategory = {
      catastrophic: categorizedFindings.filter(f => f.category === 'catastrophic'),
      critical: categorizedFindings.filter(f => f.category === 'critical'),
      serious: categorizedFindings.filter(f => f.category === 'serious'),
      minor: categorizedFindings.filter(f => f.category === 'minor'),
      positive: categorizedFindings.filter(f => f.category === 'positive')
    }
    
    // Add sections for each categorized finding - Sorted by severity: Positive first, then by severity descending
    const orderedCategories = ['positive', 'catastrophic', 'critical', 'serious', 'minor']
    
    orderedCategories.forEach(category => {
      const findings = findingsByCategory[category as keyof typeof findingsByCategory]
      findings.forEach((finding, index) => {
        const categoryNames = {
          catastrophic: 'Katastrophales Problem',
          critical: 'Kritisches Problem',
          serious: 'Ernstes Problem',
          minor: 'Geringes Problem',
          positive: 'Positiver Befund'
        }
        
        sections.push({
          type: finding.type,
          title: `${categoryNames[category as keyof typeof categoryNames]} ${index + 1}`,
          content: [finding.block],
          severity: finding.category,
          textPosition: finding.startIndex
        })
      })
    })
    
    return sections
  }


  // Get icon for severity based on usability evaluation categories
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'catastrophic': return <Skull className="h-5 w-5 text-red-700" />
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />
      case 'serious': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'minor': return <AlertCircle className="h-5 w-5 text-blue-500" />
      case 'positive': return <CheckCircle className="h-5 w-5 text-emerald-500" />
      default: return <BarChart3 className="h-5 w-5 text-blue-500" />
    }
  }

  // Get background color for severity based on usability evaluation categories
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'catastrophic': return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
      case 'critical': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'serious': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'minor': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'positive': return 'bg-emerald-100 border-emerald-500 dark:bg-emerald-900/30 dark:border-emerald-600'
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  // Get section icon based on type
  const getSectionIcon = (type: string, severity: string) => {
    switch (type) {
      case 'summary': return <BarChart3 className="h-5 w-5 text-blue-500" />
      case 'catastrophic': return <Skull className="h-5 w-5 text-red-700" />
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />
      case 'serious': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'minor': return <AlertCircle className="h-5 w-5 text-blue-500" />
      case 'positive': return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case 'accessibility': return <Shield className="h-5 w-5 text-purple-500" />
      case 'heuristics': return <BookOpen className="h-5 w-5 text-indigo-500" />
      default: return getSeverityIcon(severity)
    }
  }

  // Helper functions for severity badges based on usability evaluation categories
  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'catastrophic': return 'Katastrophal'
      case 'critical': return 'Kritisch'
      case 'serious': return 'Ernst'
      case 'minor': return 'Gering'
      case 'positive': return 'Positiv'
      default: return 'Info'
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'catastrophic': return 'bg-red-200 dark:bg-red-800/40 text-red-900 dark:text-red-200'
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
      case 'serious': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
      case 'minor': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
      case 'positive': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
    }
  }
  if (isAnalyzing) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
        <div className="bg-white dark:bg-gray-900 p-8">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-blue-200 dark:border-blue-800 animate-pulse"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              LLM-Analyse läuft...
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
              {variant === 'advanced' 
                ? 'Das Large Language Model analysiert Ihre Anwendung nach wissenschaftlichen Usability-Kriterien:' 
                : 'Das Large Language Model analysiert Ihre Anwendung nach Usability-Kriterien.'
              }
            </p>
            {variant === 'advanced' && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  <Eye className="h-3 w-3 mr-1" />
                  Nielsen-Heuristiken
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                  <Target className="h-3 w-3 mr-1" />
                  ISO 9241-11
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                  <Shield className="h-3 w-3 mr-1" />
                  WCAG 2.1
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
        <div className="bg-white dark:bg-gray-900 p-8">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="relative mb-6">
              <BarChart3 className="h-16 w-16 text-gray-400 dark:text-gray-500" />
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Star className="h-3 w-3 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Bereit für{variant === 'advanced' ? ' wissenschaftliche' : ''} Usability-Analyse
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-6">
              Laden Sie einen Screenshot hoch, füllen Sie die Kontextfelder aus und 
              wählen Sie ein Profil mit LLM-Integration, um eine detaillierte Analyse zu erhalten.
            </p>
            {variant === 'advanced' && (
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  <BookOpen className="h-3 w-3 mr-1" />
                  10 Nielsen-Heuristiken
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  <Award className="h-3 w-3 mr-1" />
                  ISO-Standards
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  <Shield className="h-3 w-3 mr-1" />
                  Barrierefreiheit
                </span>
              </div>
            )}
            {/* Show reset button if onReset is available (means an analysis was previously performed) */}
            {onReset && (
              <button 
                onClick={onReset}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Neue Analyse
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Parse the analysis into structured sections
  const parsedSections = parseAnalysis(analysis)
  
  // Calculate summary statistics based on usability evaluation categories
  const summary = {
    totalProblems: parsedSections.filter(s => ['catastrophic', 'critical', 'serious', 'minor'].includes(s.severity)).length,
    catastrophicProblems: parsedSections.filter(s => s.severity === 'catastrophic').length,
    criticalProblems: parsedSections.filter(s => s.severity === 'critical').length,
    seriousProblems: parsedSections.filter(s => s.severity === 'serious').length,
    minorProblems: parsedSections.filter(s => s.severity === 'minor').length,
    positiveFindings: parsedSections.filter(s => s.severity === 'positive').length
  }

  return (
    <div className="space-y-6">
      {/* Fixed Tooltip Portal */}
      {activeTooltip && (
        <div 
          className="fixed px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-2xl z-[99999] max-w-sm text-center pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          {activeTooltip === 'total' && 'Gesamtanzahl aller gefundenen Usability-Probleme'}
          {activeTooltip === 'catastrophic' && 'Existenzielle Bedrohungen, es besteht die Gefahr eines größeren Schadens für den Benutzer oder die Organisation. Diese Bewertung sollte nur nach Rücksprache mit dem Management vergeben werden, keinesfalls durch den UX Professional allein.'}
          {activeTooltip === 'critical' && 'Die Testteilnehmer haben aufgegeben oder sind sehr unzufrieden, oder es besteht die Gefahr eines geringfügigen Schadens für den Benutzer.'}
          {activeTooltip === 'serious' && 'Erhebliche Verzögerungen oder mäßige Unzufriedenheit.'}
          {activeTooltip === 'minor' && 'Spürbare Verzögerungen oder geringe Unzufriedenheit.'}
          {activeTooltip === 'positive' && 'Etwas, das im Rahmen des aktuellen Usability-Tests gut funktioniert hat oder den Testteilnehmern gefallen hat.'}
          
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
        </div>
      )}

      {/* Header */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Usability-Analyse abgeschlossen
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString('de-DE', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            {/* Buttons in separate row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Direct Export Buttons */}
              <button 
                onClick={() => {
                  console.log('=== TEXT EXPORT BUTTON CLICKED ===')
                  exportReport()
                }}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-black dark:text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border-0"
              >
                <FileText className="h-4 w-4 mr-2 text-black dark:text-white" />
                Text-Bericht
              </button>
              
              <button 
                onClick={() => {
                  console.log('=== JSON EXPORT BUTTON CLICKED ===')
                  exportMeasurableDataForAnalysis()
                }}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-black dark:text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border-0"
              >
                <BarChart3 className="h-4 w-4 mr-2 text-black dark:text-white" />
                Messbare Daten
              </button>
              
              <button 
                onClick={() => {
                  console.log('=== EXCEL EXPORT BUTTON CLICKED ===')
                  exportToExcelForAnalysis()
                }}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-black dark:text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border-0"
              >
                <Download className="h-4 w-4 mr-2 text-black dark:text-white" />
                Excel-Export
              </button>
              
              <button 
                onClick={handleReset}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Neue Analyse
              </button>
            </div>
            
            {/* Project Management Buttons - Separate Row */}
            <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🎯 Projekt-Management (MSAA)
                </h4>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAddToProject(true)}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    📁 Zu Projekt hinzufügen
                  </button>
                  <button 
                    onClick={() => setShowProjectManager(true)}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    🗂️ Projekt-Manager
                  </button>
                </div>
              </div>
            </div>
            
            {/* Multi-LLM Analysis Section */}
            <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ⚡ Multi-LLM Parallel Analysis
                </h4>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowMultiLLMModal(true)}
                    disabled={!contextData}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:text-gray-400 disabled:dark:text-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-100 disabled:dark:bg-gray-700 border border-gray-300 dark:border-gray-600 disabled:border-gray-200 disabled:dark:border-gray-600 disabled:cursor-not-allowed rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    LLM-Vergleich starten
                  </button>
                  {multiLLMRunning && (
                    <div className="inline-flex items-center px-3 py-2 text-sm text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300 rounded-lg">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Multi-LLM läuft...
                    </div>
                  )}
                </div>
                {!contextData && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    💡 Kontext-Daten erforderlich für Multi-LLM Analyse
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Prompt Details Toggle - Separate Row */}
          <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setShowPromptDetails(!showPromptDetails)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Eye className="h-3 w-3 mr-1.5" />
              {showPromptDetails ? 'Prompt-Details ausblenden' : 'Prompt-Details anzeigen'}
            </button>
          </div>
        </div>
      </div>

      {/* Prompt Details Dropdown */}
      {showPromptDetails && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden bg-white dark:bg-gray-900">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prompt-Details & Analyse-Informationen
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Vollständige Transparenz über den verwendeten Prompt und die Analyse-Parameter
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Metadata Section */}
            {metadata && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">LLM-Modell</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metadata.llmName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{metadata.llmModel}</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Prompt-Variante</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {variant === 'study-pure' 
                    ? 'Study-Pure (A)' 
                    : variant === 'basic' 
                      ? 'Basic (B)' 
                      : 'Advanced (C)'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {variant === 'study-pure'
                    ? 'Originalgetreue IEEE-Studie'
                    : variant === 'basic'
                      ? 'Deutsche Adaptation (UX-LLM Studie)'
                      : 'Umfassende Analyse mit Nielsen\'s Heuristiken'}
                </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Verarbeitungszeit</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {metadata.processingTimeMs ? `${metadata.processingTimeMs}ms` : 'Unbekannt'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {metadata.analysisTime ? new Date(metadata.analysisTime).toLocaleString('de-DE') : ''}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Eingabe-Daten</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${metadata.imageProvided ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      Bild: {metadata.imageProvided ? 'Vorhanden' : 'Nicht vorhanden'}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${metadata.contextProvided ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      Kontext: {metadata.contextProvided ? 'Vorhanden' : 'Nicht vorhanden'}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${metadata.supportsVision ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                      Vision: {metadata.supportsVision ? 'Unterstützt' : 'Text-only'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Benutzer-Profil</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metadata.userProfile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{metadata.userProfile.email}</p>
                </div>
              </div>
            )}
            
            {/* Full Prompt Section */}
            {promptUsed && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Vollständiger Prompt
                  </h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(promptUsed)
                      // Optional: Show toast notification
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Kopieren
                  </button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                    {promptUsed}
                  </pre>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p><strong>Wissenschaftlicher Hinweis:</strong> 
                    {variant === 'study-pure' 
                      ? 'Dieser Prompt ist eine originalgetreue Replikation der IEEE-Studie "Does GenAI Make Usability Testing Obsolete?" und ermöglicht direkte Vergleichbarkeit mit den publizierten Ergebnissen.' 
                      : variant === 'basic' 
                        ? 'Dieser Prompt wurde basierend auf der UX-LLM Studie (IEEE Xplore: 11029918) entwickelt und folgt der minimalistischen, studienkonformen Methodik für offene Problemidentifikation.' 
                        : 'Dieser Prompt wurde basierend auf der UX-LLM Studie (IEEE Xplore: 11029918) entwickelt und integriert etablierte UX-Prinzipien wie Nielsen\'s Heuristiken und ISO 9241-110 Dialogprinzipien.'
                    }
                  </p>
                </div>
              </div>
            )}
            
            {/* Prompt Architecture Information */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Prompt-Architektur
              </h4>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                    <p><strong>Struktur:</strong> 
                      {variant === 'study-pure' 
                        ? 'System-Prompt → Direkte User-Eingabe (originalgetreu ohne XML-Tags)' 
                        : 'System-Prompt → Strukturierte Eingabe → Anweisungen → Custom Prompts'
                      }
                    </p>
                    <p><strong>Wissenschaftliche Basis:</strong> 
                      {variant === 'study-pure' 
                        ? 'IEEE-Studie "Does GenAI Make Usability Testing Obsolete?" - Originalgetreue Replikation' 
                        : variant === 'basic' 
                          ? 'UX-LLM Studie (IEEE Xplore: 11029918) - Minimalistischer Ansatz' 
                          : 'UX-LLM Studie, Nielsen\'s Heuristiken, ISO 9241-110'
                      }
                    </p>
                    <p><strong>Anti-Halluzination:</strong> 
                      {variant === 'study-pure' 
                        ? 'Klare Aufgabendefinition, einfache Eingabestruktur' 
                        : 'XML-Tags, Kategorisierung, Eingabe-Begrenzung'
                      }
                    </p>
                  </div>
            </div>
          </div>
        </div>
      )}

      {/* Bewertungsfelder - Separate Box - nur für BASIC und ADVANCED */}
      {variant !== 'study-pure' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden bg-white dark:bg-gray-900">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Bewertungsfelder
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Zusammenfassung der gefundenen Usability-Probleme
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 relative cursor-help"
                onMouseEnter={(e) => handleTooltipShow('total', e)}
                onMouseLeave={handleTooltipHide}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Probleme gesamt</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalProblems}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div 
                className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700 relative cursor-help"
                onMouseEnter={(e) => handleTooltipShow('positive', e)}
                onMouseLeave={handleTooltipHide}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Positiv</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.positiveFindings}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
              </div>
              
              <div 
                className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700 relative cursor-help"
                onMouseEnter={(e) => handleTooltipShow('catastrophic', e)}
                onMouseLeave={handleTooltipHide}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Katastrophal</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">{summary.catastrophicProblems}</p>
                  </div>
                  <Skull className="h-8 w-8 text-red-700" />
                </div>
              </div>
              
              <div 
                className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700 relative cursor-help"
                onMouseEnter={(e) => handleTooltipShow('critical', e)}
                onMouseLeave={handleTooltipHide}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Kritisch</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.criticalProblems}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>
              
              <div 
                className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700 relative cursor-help"
                onMouseEnter={(e) => handleTooltipShow('serious', e)}
                onMouseLeave={handleTooltipHide}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">Ernst</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.seriousProblems}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              
              <div 
                className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700 relative cursor-help"
                onMouseEnter={(e) => handleTooltipShow('minor', e)}
                onMouseLeave={handleTooltipHide}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Gering</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.minorProblems}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Probleme im Detail - Clickable Cards */}
      {variant !== 'study-pure' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Probleme im Detail
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Klicken Sie auf ein Problem, um es im Text zu markieren
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6">
            <div className="space-y-3">
              {parsedSections.filter(section => section.type !== 'summary').map((section, index) => (
                <div key={index} className={`rounded-lg border-2 p-4 ${getSeverityColor(section.severity)} ${section.textPosition !== undefined ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                     onClick={() => section.textPosition !== undefined && highlightTextSection(section)}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getSectionIcon(section.type, section.severity)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {section.title}
                        </h4>
                        {section.severity !== 'info' && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadgeColor(section.severity)}`}>
                            {getSeverityLabel(section.severity)}
                          </span>
                        )}
                        {section.textPosition !== undefined && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                            (Klicken)
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {section.content[0] && section.content[0].length > 150 
                          ? section.content[0].substring(0, 150) + '...' 
                          : section.content[0]}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Befunde im Detail - für STUDY-PURE */}
      {variant === 'study-pure' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Befunde im Detail
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Klicken Sie auf einen Befund, um ihn im Text zu markieren
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6">
            <div className="space-y-3">
              {parseStudyPureFindings(analysis).map((finding, index) => (
                <div key={index} className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
                     onClick={() => highlightTextSection(finding)}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <AlertCircle className="h-5 w-5 text-gray-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Befund {index + 1}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                          (Klicken)
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {finding.length > 150 ? finding.substring(0, 150) + '...' : finding}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detaillierte Analyse */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Vollständige Analyse
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Detaillierte Beschreibung aller Befunde
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-6 max-h-[600px] overflow-y-auto" data-analysis-text>
          {highlightedSection && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Markierter Text: "{cleanTextForDisplay(highlightedSection).substring(0, 50)}..."
                </span>
                <button
                  onClick={() => setHighlightedSection(null)}
                  className="text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                >
                  Markierung entfernen
                </button>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            {renderTextWithHighlighting(analysis)}
          </div>

          {/* Fallback für unstrukturierte Analyse */}
          {parsedSections.length === 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6" data-analysis-text>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analyse-Ergebnisse
              </h3>
              <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {cleanTextForDisplay(analysis)}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Project Management Modals */}
      <ProjectManagerModal 
        isOpen={showProjectManager}
        onClose={() => setShowProjectManager(false)}
      />
      
      <AddToProjectModal 
        isOpen={showAddToProject}
        onClose={() => setShowAddToProject(false)}
        analysisData={prepareAnalysisDataForProject()}
        onSuccess={(projectId, surfaceName) => {
          console.log(`✅ Analyse "${surfaceName}" erfolgreich zu Projekt ${projectId} hinzugefügt!`);
        }}
      />
      
      {/* Multi-LLM Analysis Modal */}
      <MultiLLMModal 
        isOpen={showMultiLLMModal}
        onClose={() => setShowMultiLLMModal(false)}
        contextData={contextData}
        promptVariant={promptVariant}
        promptLanguage={promptLanguage}
        onResultsReady={(results) => {
          setMultiLLMResults(results);
          console.log(`✅ Multi-LLM Analysis abgeschlossen: ${results.successfulAnalyses}/${results.totalLLMs} erfolgreich`);
        }}
      />
    </div>
  )
}
