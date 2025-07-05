'use client'

import { useState } from 'react'
import { Upload, User, Settings, BarChart3 } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import ProfileSelector from '@/components/ProfileSelector'
import ContextForm from '@/components/ContextForm'
import UsabilityAnalysis from '@/components/UsabilityAnalysis'

interface Profile {
  id: string;
  name: string;
  email: string;
  selectedModel: string;
  apiKey: string;
}

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: '1', name: 'UX Designer', email: 'ux@company.com', selectedModel: 'gpt4o', apiKey: 'DUMMY_KEY_1' },
    { id: '2', name: 'UI Developer', email: 'dev@company.com', selectedModel: 'claude4', apiKey: 'DUMMY_KEY_2' },
  ])
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [contextData, setContextData] = useState({
    description: '',
    uiCode: ''
  })
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    const selectedProfile = profiles.find(p => p.id === selectedProfileId);

    if (!selectedProfile || !uploadedImage || !contextData.description) {
      alert('Bitte füllen Sie alle erforderlichen Felder aus.')
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: selectedProfile,
          apiKey: selectedProfile.apiKey, // API-Key mitsenden
          image: uploadedImage,
          context: contextData,
        }),
      })

      if (!response.ok) {
        throw new Error('Fehler bei der Analyse')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error(error)
      alert('Es gab ein Problem bei der Analyse. Bitte versuchen Sie es erneut.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setAnalysis(null)
    setUploadedImage(null)
    setContextData({ description: '', uiCode: '' })
    setSelectedProfileId('')
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Usability Tester
          </h1>
          <p className="text-xl text-muted-foreground">
            LLM-gestützte Analyse digitaler Anwendungen nach ISO-Standards
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Profile Selection */}
            <div className="bg-secondary/50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Profil & LLM-Auswahl</h2>
              </div>
              <ProfileSelector 
                selectedProfile={selectedProfileId}
                onProfileChange={setSelectedProfileId}
                profiles={profiles}
                onProfilesChange={setProfiles}
              />
            </div>

            {/* Image Upload */}
            <div className="bg-secondary/50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Screenshot Upload</h2>
              </div>
              <ImageUpload 
                onImageUpload={setUploadedImage}
                uploadedImage={uploadedImage}
              />
            </div>

            {/* Context Form */}
            <div className="bg-secondary/50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Kontext & Code</h2>
              </div>
              <ContextForm 
                contextData={contextData}
                onContextChange={setContextData}
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedProfileId || !uploadedImage || !contextData.description}
              className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold 
                         hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-200"
            >
              {isAnalyzing ? 'Analysiere...' : 'Usability analysieren'}
            </button>
          </div>

          {/* Right Column - Analysis */}
          <div className="bg-secondary/50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Usability-Analyse</h2>
            </div>
            <UsabilityAnalysis 
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
