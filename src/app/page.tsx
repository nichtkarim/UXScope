'use client'

import { useState, useEffect } from 'react'
import { Upload, User, Settings, BarChart3, Clock, Moon, Sun, AlertCircle, Target, BookOpen, Brain } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import ProfileSelector from '@/components/ProfileSelector'
import ContextForm from '@/components/ContextForm'
import UsabilityAnalysis from '@/components/UsabilityAnalysis'
import AnalysisHistoryView from '@/components/AnalysisHistoryView'
import ScientificEvaluation from '@/components/ScientificEvaluation'
import AlternativeEvaluation from '@/components/AlternativeEvaluation'
import MethodologyView from '@/components/MethodologyView'
import MethodologyReflection from '@/components/MethodologyReflection'
import { profileStorage, analysisHistory } from '@/lib/storage'
import { Profile, LLMAnalysis, UsabilityProblem } from '@/types'
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
    promptVariant: 'extended' as PromptVariant  // Default auf extended
  })
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'analyze' | 'history' | 'evaluation' | 'alternative' | 'methodology' | 'reflection'>('analyze')
  const [darkMode, setDarkMode] = useState(false)
  
  // Wissenschaftliche Daten für die Bachelorarbeit
  const [llmAnalyses, setLlmAnalyses] = useState<LLMAnalysis[]>([])
  const [groundTruth, setGroundTruth] = useState<UsabilityProblem[]>([])
  const [currentAnalysisMetadata, setCurrentAnalysisMetadata] = useState<any>(null)

  // Profile aus localStorage laden
  useEffect(() => {
    const storedProfiles = profileStorage.getProfiles()
    if (storedProfiles.length > 0) {
      setProfiles(storedProfiles)
    } else {
      // Fallback auf Demo-Profile für wissenschaftliche LLMs
      const defaultProfiles = [
        { id: '1', name: 'GPT-4o Researcher', email: 'gpt4o@research.com', selectedModel: 'gpt4o', apiKey: 'DEMO_KEY_GPT4O', createdAt: new Date('2024-01-01') },
        { id: '2', name: 'Claude 4 Researcher', email: 'claude4@research.com', selectedModel: 'claude4', apiKey: 'DEMO_KEY_CLAUDE4', createdAt: new Date('2024-01-01') },
        { id: '3', name: 'Llama 3 Researcher', email: 'llama3@research.com', selectedModel: 'llama3', apiKey: 'DEMO_KEY_LLAMA3', createdAt: new Date('2024-01-01') },
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
      // Debug: Log what we're sending
      console.log('Sending analysis request:', {
        profile: {
          id: selectedProfile.id,
          selectedModel: selectedProfile.selectedModel,
          hasApiKey: !!selectedProfile.apiKey
        },
        context: {
          description: contextData.description,
          uiCode: contextData.uiCode,
          userTask: contextData.userTask,
          customPrompt: contextData.customPrompt
        },
        hasImage: !!uploadedImage
      })

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: selectedProfile,
          image: uploadedImage,
          context: {
            description: contextData.description,
            uiCode: contextData.uiCode || '',
            userTask: contextData.userTask || 'Allgemeine Nutzung der Anwendung',
            viewName: 'Hauptansicht',
            customPrompt: contextData.customPrompt || '',
            promptVariant: contextData.promptVariant || 'extended'
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }))
        const errorMessage = errorData?.error || 'Fehler bei der Analyse'
        
        if (response.status === 401) {
          alert('API-Key ist ungültig. Bitte überprüfen Sie Ihren API-Key in den Profileinstellungen.')
        } else if (response.status === 429) {
          alert('Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.')
        } else {
          alert(`Fehler bei der Analyse: ${errorMessage}`)
        }
        
        console.error('API Error:', { status: response.status, error: errorMessage })
        return // Exit gracefully instead of throwing
      }

      const data = await response.json()
      
      if (!data.analysis) {
        throw new Error('Keine Analyse-Daten erhalten')
      }
      
      setAnalysis(data.analysis)
      setCurrentAnalysisMetadata(data.metadata)
      
      // Speichere LLM-Analyse für wissenschaftliche Auswertung
      if (data.metadata) {
        const newLLMAnalysis: LLMAnalysis = {
          llmId: selectedProfile.selectedModel,
          llmName: selectedProfile.selectedModel,
          problems: [], // Würde in einer vollständigen Implementierung aus der Antwort geparst
          analysisTime: new Date(),
          promptUsed: data.metadata.promptUsed,
          rawResponse: data.rawResponse || data.analysis
        }
        
        setLlmAnalyses(prev => [...prev.filter(a => a.llmId !== selectedProfile.selectedModel), newLLMAnalysis])
      }
      
      // Analyse zur Historie hinzufügen
      analysisHistory.addAnalysis({
        profileId: selectedProfile.id,
        contextDescription: contextData.description,
        analysis: data.analysis,
        imageName: 'Screenshot'
      })
      
    } catch (error) {
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
    setContextData({ description: '', uiCode: '', userTask: '', customPrompt: '', promptVariant: 'extended' })
    setSelectedProfileId('')
    setCurrentAnalysisMetadata(null)
  }

  const handleLoadFromHistory = (historyItem: any) => {
    setContextData({ 
      description: historyItem.contextDescription, 
      uiCode: '',
      userTask: '',
      customPrompt: '',
      promptVariant: 'extended'
    })
    setAnalysis(historyItem.analysis)
    setSelectedProfileId(historyItem.profileId)
    setActiveTab('analyze')
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="text-center mb-8 relative">
              <button
                onClick={toggleDarkMode}
                className="absolute top-0 right-0 p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                LLM-basierte Usability-Evaluation
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Wissenschaftliche Methodik zur Usability-Bewertung digitaler Anwendungen
              </p>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                Bachelorarbeit: Vergleich von GPT-4o, Claude 4 und Llama 3
              </div>
            </header>

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
                onClick={() => setActiveTab('evaluation')}
                className={`px-4 py-2 rounded-md transition-colors text-sm ${
                  activeTab === 'evaluation'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-500 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Evaluation
                </div>
              </button>
              <button
                onClick={() => setActiveTab('alternative')}
                className={`px-4 py-2 rounded-md transition-colors text-sm ${
                  activeTab === 'alternative'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-500 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Alternative Evaluation
                </div>
              </button>
              <button
                onClick={() => setActiveTab('methodology')}
                className={`px-4 py-2 rounded-md transition-colors text-sm ${
                  activeTab === 'methodology'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-500 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Methodik
                </div>
              </button>
              <button
                onClick={() => setActiveTab('reflection')}
                className={`px-4 py-2 rounded-md transition-colors text-sm ${
                  activeTab === 'reflection'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-500 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Kritische Reflexion
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
                    promptUsed={currentAnalysisMetadata?.promptUsed}
                    metadata={currentAnalysisMetadata}
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'history' ? (
            <div className="max-w-4xl mx-auto">
              <AnalysisHistoryView onLoadAnalysis={handleLoadFromHistory} />
            </div>
          ) : activeTab === 'evaluation' ? (
            <div className="max-w-6xl mx-auto">
              <ScientificEvaluation 
                llmAnalyses={llmAnalyses}
                groundTruth={groundTruth}
                onExportResults={(results) => {
                  console.log('Export Results:', results)
                  // Hier könnte man die Ergebnisse speichern oder weiterverarbeiten
                }}
              />
            </div>
          ) : activeTab === 'alternative' ? (
            <div className="max-w-6xl mx-auto">
              <AlternativeEvaluation 
                llmAnalyses={llmAnalyses}
                onExportResults={(results) => {
                  console.log('Alternative Export Results:', results)
                  // Hier könnte man die qualitativen Ergebnisse speichern oder weiterverarbeiten
                }}
              />
            </div>
          ) : activeTab === 'methodology' ? (
            <div className="max-w-4xl mx-auto">
              <MethodologyView />
            </div>
          ) : activeTab === 'reflection' ? (
            <div className="max-w-4xl mx-auto">
              <MethodologyReflection />
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
