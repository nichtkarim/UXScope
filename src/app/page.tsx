'use client'

import { useState, useEffect } from 'react'
import { Upload, User, Settings, BarChart3, Clock, Moon, Sun, AlertCircle } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import ProfileSelector from '@/components/ProfileSelector'
import ContextForm from '@/components/ContextForm'
import UsabilityAnalysis from '@/components/UsabilityAnalysis'
import AnalysisHistoryView from '@/components/AnalysisHistoryView'

import { profileStorage, analysisHistory } from '@/lib/storage'
import { Profile } from '@/types'
import { PromptVariant } from '@/lib/promptEngineering'

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [contextData, setContextData] = useState({
    description: '',
    uiCode: '',
    userTask: '',
    customPrompt: '',
    promptVariant: 'advanced' as PromptVariant,  // Default auf advanced
    uiMode: 'generalized' as 'swiftui-only' | 'generalized'  // Default auf generalized
  })
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'analyze' | 'history'>('analyze')
  const [darkMode, setDarkMode] = useState(false)
  const [promptLanguage, setPromptLanguage] = useState<'de' | 'en'>('de')
  
  // Add state for structured findings from API
  const [currentAnalysisFindings, setCurrentAnalysisFindings] = useState<any[]>([])
  
  // Add state for the used prompt and metadata
  const [currentPromptUsed, setCurrentPromptUsed] = useState<string | null>(null)
  const [currentMetadata, setCurrentMetadata] = useState<any>(null)

  // Profile aus localStorage laden
  useEffect(() => {
    const storedProfiles = profileStorage.getProfiles()
    
    // Prüfe ob gespeicherte Profile gültige Model-IDs haben
    const validModelIds = ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet', 'claude-3-haiku']
    const validProfiles = storedProfiles.filter(profile => 
      profile.selectedModel && validModelIds.includes(profile.selectedModel)
    )
    
    if (validProfiles.length > 0) {
      setProfiles(validProfiles)
    } else {
      // Fallback auf Demo-Profile für wissenschaftliche LLMs
      const defaultProfiles = [
        { id: '1', name: 'GPT-4o Researcher', email: 'gpt4o@research.com', selectedModel: 'gpt-4o', apiKey: 'DEMO_KEY_GPT4O', createdAt: new Date('2024-01-01') },
        { id: '2', name: 'Claude 3.5 Researcher', email: 'claude@research.com', selectedModel: 'claude-3-5-sonnet', apiKey: 'DEMO_KEY_CLAUDE', createdAt: new Date('2024-01-01') },
        { id: '3', name: 'GPT-4o Mini Researcher', email: 'gpt4omini@research.com', selectedModel: 'gpt-4o-mini', apiKey: 'DEMO_KEY_GPT4OMINI', createdAt: new Date('2024-01-01') },
      ]
      setProfiles(defaultProfiles)
      // Speichere Demo-Profile explizit
      profileStorage.saveProfiles(defaultProfiles)
    }
  }, [])

  // Dark Mode aus localStorage laden
  useEffect(() => {
    // Verwende requestAnimationFrame um Hydration-Konflikte zu vermeiden
    requestAnimationFrame(() => {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true'
      setDarkMode(savedDarkMode)
      // Setze die Dark Mode-Klasse direkt beim Laden
      if (savedDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    })
  }, [])

  // Language preference aus localStorage laden
  useEffect(() => {
    requestAnimationFrame(() => {
      const savedLanguage = localStorage.getItem('promptLanguage') as 'de' | 'en'
      if (savedLanguage) {
        setPromptLanguage(savedLanguage)
      }
    })
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleAnalyze = async () => {
    const selectedProfile = profiles.find(p => p.id === selectedProfileId);

    // Erweiterte Validierung
    if (!selectedProfile) {
      alert('Bitte wählen Sie ein Profil aus.')
      return
    }

    if (!selectedProfile.apiKey || selectedProfile.apiKey.trim() === '') {
      alert('Das ausgewählte Profil hat keinen API-Key. Bitte erstellen Sie ein neues Profil mit einem gültigen API-Key.')
      return
    }

    // Warnung für Demo-API-Keys
    if (selectedProfile.apiKey.startsWith('DEMO_KEY_')) {
      const shouldContinue = confirm(
        'Sie verwenden einen Demo-API-Key. Die Analyse wird fehlschlagen. ' +
        'Möchten Sie trotzdem fortfahren, um den API-Aufruf zu testen?'
      )
      if (!shouldContinue) {
        return
      }
    }

    if (!uploadedImage) {
      alert('Bitte laden Sie einen Screenshot hoch.')
      return
    }

    if (!contextData.description || contextData.description.trim() === '') {
      alert('Bitte geben Sie eine Beschreibung der Anwendung ein.')
      return
    }

    setIsAnalyzing(true)

    try {
      const requestBody = {
        userProfile: selectedProfile,
        image: uploadedImage,
        context: {
          description: contextData.description,
          uiCode: contextData.uiCode || '',
          userTask: contextData.userTask || 'Allgemeine Nutzung der Anwendung',
          viewName: 'Hauptansicht',
          customPrompt: contextData.customPrompt || '',
          promptVariant: contextData.promptVariant || 'advanced',
          language: promptLanguage,
          uiMode: contextData.uiMode || 'generalized'
        },
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        let errorData
        let errorMessage = 'Unbekannter Fehler'
        
        try {
          const responseText = await response.text()
          
          // Log raw response für debugging
          console.error('Raw API Error Response (first 500 chars):', responseText.substring(0, 500))
          
          try {
            errorData = JSON.parse(responseText)
            errorMessage = errorData?.error || `HTTP ${response.status}: ${response.statusText}`
          } catch (jsonError) {
            console.error('Failed to parse error JSON:', jsonError)
            if (responseText.includes('Internal Server Error') || responseText.includes('<html')) {
              errorMessage = `Server Error (${response.status}): Internal Server Error`
            } else {
              errorMessage = `HTTP ${response.status}: ${response.statusText} - ${responseText.substring(0, 200)}`
            }
          }
        } catch (textError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        
        if (response.status === 401) {
          alert('API-Key ist ungültig. Bitte überprüfen Sie Ihren API-Key in den Profileinstellungen.')
        } else if (response.status === 429) {
          alert('Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.')
        } else if (response.status === 500) {
          alert('Server-Fehler. Bitte überprüfen Sie die Konsole für weitere Details und versuchen Sie es erneut.')
        } else {
          alert(`Fehler bei der Analyse: ${errorMessage}`)
        }
        
        console.error('API Error Details:', { 
          status: response.status, 
          statusText: response.statusText,
          error: errorMessage,
          errorData: errorData,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries())
        })
        
        // Zusätzliche Debug-Informationen
        if (errorData) {
          console.error('Parsed Error Data:', errorData)
          if (errorData.details) {
            console.error('Error Details:', errorData.details)
          }
        }
        return
      }

      const responseText = await response.text()
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError)
        console.error('Response text:', responseText)
        throw new Error('Server returned invalid JSON response')
      }
      
      if (!data.analysis) {
        throw new Error('Keine Analyse-Daten erhalten')
      }
      
      setAnalysis(data.analysis)
      setCurrentAnalysisFindings(data.findings || []) // Set structured findings
      setCurrentPromptUsed(data.promptUsed || data.metadata?.promptUsed || null) // Set the used prompt with fallback
      setCurrentMetadata(data.metadata || null) // Set metadata
      
      // Analyse zur Historie hinzufügen
      analysisHistory.addAnalysis({
        profileId: selectedProfile.id,
        contextDescription: contextData.description,
        analysis: data.analysis,
        imageName: 'Screenshot'
      })
      
    } catch (error) {
      // Fehlerbehandlung für Netzwerkfehler (z.B. Server nicht erreichbar)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        alert('Verbindung zur API fehlgeschlagen. Ist der Server gestartet? Läuft Next.js auf dem richtigen Port?')
        console.error('Netzwerkfehler beim API-Aufruf:', error)
        return
      }
      console.error('Analysis Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
      alert(`Es gab ein Problem bei der Analyse: ${errorMessage}. Bitte versuchen Sie es erneut.`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setAnalysis(null)
    setUploadedImage(null)
    setContextData({ description: '', uiCode: '', userTask: '', customPrompt: '', promptVariant: 'advanced', uiMode: 'generalized' })
    setSelectedProfileId('')
    setCurrentAnalysisFindings([]) // Reset findings
    setCurrentPromptUsed(null) // Reset prompt
    setCurrentMetadata(null) // Reset metadata
  }

  const handleLoadFromHistory = (historyItem: any) => {
    setContextData({ 
      description: historyItem.contextDescription, 
      uiCode: '',
      userTask: '',
      customPrompt: '',
      promptVariant: 'advanced',
      uiMode: 'generalized'
    })
    setAnalysis(historyItem.analysis)
    setSelectedProfileId(historyItem.profileId)
    setActiveTab('analyze')
  }

  const toggleLanguage = () => {
    const newLanguage = promptLanguage === 'de' ? 'en' : 'de'
    setPromptLanguage(newLanguage)
    localStorage.setItem('promptLanguage', newLanguage)
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="text-center mb-8 relative">
              <div className="absolute top-0 right-0 flex gap-2">
                <button
                  onClick={toggleLanguage}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                  title={`Prompt-Sprache: ${promptLanguage === 'de' ? 'Deutsch' : 'English'} (klicken zum Wechseln)`}
                >
                  <span className="text-xs font-medium">
                    Prompts: {promptLanguage.toUpperCase()}
                  </span>
                </button>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                  title={darkMode ? 'Light Mode' : 'Dark Mode'}
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                UXScope
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Eine Untersuchung der Fähigkeiten von Large Language Models (LLMs) zur automatisierten Erkennung und Bewertung von Usability in digitalen Anwendungen
              </p>
            </header>

          {/* Sprach-Toggle Hinweis */}
          <div className="mb-6 flex justify-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 max-w-4xl">
              <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                💡 <strong>Sprach-Toggle:</strong> Der Sprachschalter (DE/EN) in der Kopfzeile steuert die Sprache aller generierten Prompts. 
                Die Benutzeroberfläche bleibt auf Deutsch. Alle drei Varianten sind vollständig in beiden Sprachen verfügbar.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <button
                onClick={() => setActiveTab('analyze')}
                className={`px-4 py-2 rounded-md transition-colors text-sm ${
                  activeTab === 'analyze'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-500 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analyse
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-md transition-colors text-sm ${
                  activeTab === 'history'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-500 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Historie
                </div>
              </button>
            </div>
          </nav>

          {activeTab === 'analyze' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Input */}
              <div className="space-y-6">
                {/* Profile Selection */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Profil & LLM-Auswahl</h2>
                  </div>
                  <ProfileSelector 
                    selectedProfile={selectedProfileId}
                    onProfileChange={setSelectedProfileId}
                    profiles={profiles}
                    onProfilesChange={setProfiles}
                  />
                </div>

                {/* Image Upload */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Screenshot Upload</h2>
                  </div>
                  <ImageUpload 
                    onImageUpload={setUploadedImage}
                    uploadedImage={uploadedImage}
                  />
                </div>

                {/* Context Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Kontext & Code</h2>
                  </div>
                  <ContextForm 
                    contextData={contextData}
                    onContextChange={setContextData}
                  />
                </div>

                {/* Analyze Button */}
                <div className="space-y-4">
                  {/* Warning if selected profile has no API key */}
                  {selectedProfileId && profiles.find(p => p.id === selectedProfileId && (!p.apiKey || p.apiKey.trim() === '')) && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Kein API-Key verfügbar</span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Das ausgewählte Profil hat keinen API-Key. Bitte erstellen Sie ein neues Profil mit einem gültigen API-Key, um die Analyse durchzuführen.
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !selectedProfileId || !uploadedImage || !contextData.description || 
                      Boolean(selectedProfileId && profiles.find(p => p.id === selectedProfileId && (!p.apiKey || p.apiKey.trim() === '')))}
                    className="w-full bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-800/30 
                               text-orange-900 dark:text-orange-100 py-3 px-6 rounded-lg font-bold
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-200 shadow-md hover:shadow-lg
                               border-2 border-orange-500 hover:border-orange-600 dark:border-orange-400 dark:hover:border-orange-300"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-900 dark:border-orange-100 border-t-transparent"></div>
                        <span className="font-bold text-orange-900 dark:text-orange-100">Analysiere...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <BarChart3 className="h-4 w-4 text-orange-900 dark:text-orange-100" />
                        <span className="font-bold text-orange-900 dark:text-orange-100">Usability analysieren</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column - Analysis */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Usability-Analyse</h2>
                  </div>
                </div>
                <div className="p-6">
                  <UsabilityAnalysis 
                    analysis={analysis}
                    isAnalyzing={isAnalyzing}
                    onReset={handleReset}
                    promptVariant={contextData.promptVariant}
                    promptUsed={currentPromptUsed || undefined}
                    metadata={currentMetadata}
                    findings={currentAnalysisFindings} // Pass findings to UsabilityAnalysis
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'history' ? (
            <div className="max-w-4xl mx-auto">
              <AnalysisHistoryView onLoadAnalysis={handleLoadFromHistory} />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <AnalysisHistoryView onLoadAnalysis={handleLoadFromHistory} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
