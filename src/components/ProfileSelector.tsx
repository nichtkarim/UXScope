'use client'

import React, { useState } from 'react'
import { User, Settings, Save, X, Key, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react'
import { Profile } from '@/types'
import { llmModels } from '@/lib/constants'
import { LLM_MODELS, validateApiKey } from '@/lib/llmProviders'
import { profileStorage } from '@/lib/storage'
import NoSSR from './NoSSR'

interface ProfileSelectorProps {
  selectedProfile: string
  onProfileChange: (profileId: string) => void
  profiles: Profile[]
  onProfilesChange: (profiles: Profile[]) => void
}

export default function ProfileSelector({ 
  selectedProfile, 
  onProfileChange, 
  profiles, 
  onProfilesChange 
}: ProfileSelectorProps) {
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showApiKeyHelp, setShowApiKeyHelp] = useState(false)
  const [newProfile, setNewProfile] = useState<{
    name: string
    email: string
    selectedModel: string
    apiKey: string
  }>({
    name: '',
    email: '',
    selectedModel: 'gpt-4o',
    apiKey: ''
  })

  const validateProfile = (): boolean => {
    const errors: string[] = []
    
    if (!newProfile.name.trim()) {
      errors.push('Name ist erforderlich')
    }
    
    if (!newProfile.email.trim()) {
      errors.push('E-Mail ist erforderlich')
    } else if (!/\S+@\S+\.\S+/.test(newProfile.email)) {
      errors.push('Ungültige E-Mail-Adresse')
    }
    
    if (!newProfile.selectedModel) {
      errors.push('Bitte wählen Sie ein LLM-Modell')
    }
    
    // API-Key-Validierung
    const modelConfig = LLM_MODELS[newProfile.selectedModel]
    if (modelConfig?.requiresApiKey && !newProfile.apiKey.trim()) {
      errors.push('API-Key ist erforderlich für dieses Modell')
    } else if (modelConfig?.requiresApiKey && !validateApiKey(modelConfig.provider, newProfile.apiKey)) {
      errors.push('Ungültiger API-Key für das gewählte Modell')
    }
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleCreateProfile = () => {
    if (!validateProfile()) {
      return
    }

    try {
      const profile = profileStorage.addProfile({
        name: newProfile.name,
        email: newProfile.email,
        selectedModel: newProfile.selectedModel,
        apiKey: newProfile.apiKey
      })

      // Profile-Liste aktualisieren
      const updatedProfiles = [...profiles, profile]
      onProfilesChange(updatedProfiles)
      onProfileChange(profile.id)

      // Reset form
      setNewProfile({
        name: '',
        email: '',
        selectedModel: 'gpt-4o',
        apiKey: ''
      })
      setIsCreatingProfile(false)
      setValidationErrors([])
      
      console.log('✅ Profil erstellt:', profile)
    } catch (error) {
      console.error('❌ Fehler beim Erstellen des Profils:', error)
      setValidationErrors(['Fehler beim Erstellen des Profils'])
    }
  }

  const handleDeleteProfile = (profileId: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie dieses Profil löschen möchten?')) {
      try {
        // Profil aus dem Storage entfernen
        profileStorage.deleteProfile(profileId)
        
        // Profile-Liste aktualisieren
        const updatedProfiles = profiles.filter(p => p.id !== profileId)
        onProfilesChange(updatedProfiles)
        
        // Falls das gelöschte Profil gerade ausgewählt war, Auswahl zurücksetzen
        if (selectedProfile === profileId) {
          onProfileChange('')
        }
        
        console.log('✅ Profil gelöscht:', profileId)
      } catch (error) {
        console.error('❌ Fehler beim Löschen des Profils:', error)
        alert('Fehler beim Löschen des Profils')
      }
    }
  }

  const getApiKeyPlaceholder = (modelId: string): string => {
    const config = LLM_MODELS[modelId]
    if (!config) return 'API-Key eingeben'
    
    switch (config.provider) {
      case 'openai':
        return 'sk-...'
      case 'anthropic':
        return 'sk-ant-...'
      case 'together':
        return 'Ihr Together AI API-Key'
      case 'local':
        return 'Kein API-Key erforderlich'
      default:
        return 'API-Key eingeben'
    }
  }

  const getApiKeyHelp = (modelId: string): string => {
    const config = LLM_MODELS[modelId]
    if (!config) return ''
    
    switch (config.provider) {
      case 'openai':
        return 'Erhalten Sie Ihren API-Key unter: https://platform.openai.com/api-keys'
      case 'anthropic':
        return 'Erhalten Sie Ihren API-Key unter: https://console.anthropic.com/'
      case 'together':
        return 'Erhalten Sie Ihren API-Key unter: https://api.together.xyz/settings/api-keys'
      case 'local':
        return 'Lokale LLMs benötigen keinen API-Key. Stellen Sie sicher, dass Ollama läuft.'
      default:
        return ''
    }
  }

  const isApiKeyValid = (modelId: string, apiKey: string): boolean => {
    const config = LLM_MODELS[modelId]
    if (!config || !config.requiresApiKey) return true
    return validateApiKey(config.provider, apiKey)
  }

  const requiresApiKey = (modelId: string): boolean => {
    const config = LLM_MODELS[modelId]
    return config?.requiresApiKey || false
  }

  return (
    <NoSSR>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <User className="h-5 w-5" />
          Benutzerprofil
        </h3>
        
        {/* Profil-Auswahl */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Profil auswählen
          </label>
          <select
            value={selectedProfile}
            onChange={(e) => onProfileChange(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Profil wählen...</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name} ({llmModels.find(m => m.id === profile.selectedModel)?.name})
              </option>
            ))}
          </select>
        </div>

        {/* Ausgewähltes Profil anzeigen */}
        {selectedProfile && profiles.find(p => p.id === selectedProfile) && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {profiles.find(p => p.id === selectedProfile)?.name}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p><strong>E-Mail:</strong> {profiles.find(p => p.id === selectedProfile)?.email}</p>
                  <p><strong>Modell:</strong> {llmModels.find(m => m.id === profiles.find(p => p.id === selectedProfile)?.selectedModel)?.name}</p>
                  <p><strong>API-Key:</strong> {profiles.find(p => p.id === selectedProfile)?.apiKey ? '✓ Konfiguriert' : '✗ Nicht konfiguriert'}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteProfile(selectedProfile)}
                className="ml-4 p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Profil löschen"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Neues Profil erstellen */}
        {!isCreatingProfile ? (
          <button
            onClick={() => setIsCreatingProfile(true)}
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Neues Profil erstellen</span>
          </button>
        ) : (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Neues Profil erstellen
              </h4>
              <button
                onClick={() => {
                  setIsCreatingProfile(false)
                  setValidationErrors([])
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newProfile.name}
                  onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Ihr Name"
                />
              </div>
              
              {/* E-Mail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  E-Mail *
                </label>
                <input
                  type="email"
                  value={newProfile.email}
                  onChange={(e) => setNewProfile({ ...newProfile, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="ihre.email@example.com"
                />
              </div>
              
              {/* LLM-Modell */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LLM-Modell *
                </label>
                <select
                  value={newProfile.selectedModel}
                  onChange={(e) => setNewProfile({ ...newProfile, selectedModel: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">LLM wählen...</option>
                  {llmModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} {model.supportVision ? '🔍' : ''}
                    </option>
                  ))}
                </select>
                {newProfile.selectedModel && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {llmModels.find(m => m.id === newProfile.selectedModel)?.description}
                  </p>
                )}
              </div>
              
              {/* API-Key */}
              {requiresApiKey(newProfile.selectedModel) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Key className="inline h-4 w-4 mr-1" />
                    API-Key *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newProfile.apiKey}
                      onChange={(e) => setNewProfile({ ...newProfile, apiKey: e.target.value })}
                      placeholder={getApiKeyPlaceholder(newProfile.selectedModel)}
                      className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {newProfile.apiKey && (
                        isApiKeyValid(newProfile.selectedModel, newProfile.apiKey) ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Ihr API-Key wird sicher gespeichert und nur für die Analyse verwendet.
                  </p>
                  
                  {/* API-Key-Hilfe */}
                  <button
                    type="button"
                    onClick={() => setShowApiKeyHelp(!showApiKeyHelp)}
                    className="mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Info className="h-4 w-4 mr-1" />
                    Wo finde ich meinen API-Key?
                  </button>
                  
                  {showApiKeyHelp && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {getApiKeyHelp(newProfile.selectedModel)}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Validierungsfehler */}
              {validationErrors.length > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Bitte beheben Sie folgende Probleme:
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCreateProfile}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Profil erstellen
                </button>
                <button
                  onClick={() => {
                    setIsCreatingProfile(false)
                    setValidationErrors([])
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </NoSSR>
  )
}
