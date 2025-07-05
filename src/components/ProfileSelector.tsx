'use client'

import { useState } from 'react'
import { User, Plus, Settings, KeyRound } from 'lucide-react'
import { llmModels } from '@/lib/constants'

interface Profile {
  id: string;
  name: string;
  email: string;
  selectedModel: string;
  apiKey: string;
}

interface ProfileSelectorProps {
  selectedProfile: string
  onProfileChange: (profileId: string) => void;
  profiles: Profile[];
  onProfilesChange: (profiles: Profile[]) => void;
}

export default function ProfileSelector({ selectedProfile, onProfileChange, profiles, onProfilesChange }: ProfileSelectorProps) {
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [newProfile, setNewProfile] = useState({
    name: '',
    email: '',
    selectedModel: '',
    apiKey: ''
  })

  const handleCreateProfile = () => {
    if (newProfile.name && newProfile.email && newProfile.selectedModel && newProfile.apiKey) {
      const newId = (profiles.length + 1).toString()
      const newProfileData: Profile = { id: newId, ...newProfile };
      onProfilesChange([...profiles, newProfileData]);
      setIsCreatingProfile(false)
      setNewProfile({ name: '', email: '', selectedModel: '', apiKey: '' })
    }
  }

  return (
    <div className="space-y-4">
      {/* Profile Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Profil auswählen
        </label>
        <select
          value={selectedProfile}
          onChange={(e) => onProfileChange(e.target.value)}
          className="w-full p-3 border border-border rounded-lg bg-background text-foreground 
                     focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Profil wählen...</option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name} ({llmModels.find(m => m.id === profile.selectedModel)?.name})
            </option>
          ))}
        </select>
      </div>

      {/* Create New Profile Button */}
      <button
        onClick={() => setIsCreatingProfile(!isCreatingProfile)}
        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Neues Profil erstellen
      </button>

      {/* Create Profile Form */}
      {isCreatingProfile && (
        <div className="bg-background border border-border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Neues Profil erstellen
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Name
            </label>
            <input
              type="text"
              value={newProfile.name}
              onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border border-border rounded bg-background text-foreground 
                         focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="z.B. UX Researcher"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              E-Mail
            </label>
            <input
              type="email"
              value={newProfile.email}
              onChange={(e) => setNewProfile(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-2 border border-border rounded bg-background text-foreground 
                         focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="ihre.email@domain.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Bevorzugtes LLM
            </label>
            <select
              value={newProfile.selectedModel}
              onChange={(e) => setNewProfile(prev => ({ ...prev, selectedModel: e.target.value }))}
              className="w-full p-2 border border-border rounded bg-background text-foreground 
                         focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">LLM wählen...</option>
              {llmModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            {newProfile.selectedModel && (
              <p className="text-xs text-muted-foreground mt-1">
                {llmModels.find(m => m.id === newProfile.selectedModel)?.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1">
              <KeyRound className="h-3 w-3" />
              API Key
            </label>
            <input
              type="password"
              value={newProfile.apiKey}
              onChange={(e) => setNewProfile(prev => ({ ...prev, apiKey: e.target.value }))}
              className="w-full p-2 border border-border rounded bg-background text-foreground 
                         focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ihr API-Key für das gewählte LLM"
            />
             <p className="text-xs text-muted-foreground mt-1">
                Ihr API-Key wird sicher gespeichert und nur für die Analyse verwendet.
              </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCreateProfile}
              disabled={!newProfile.name || !newProfile.email || !newProfile.selectedModel || !newProfile.apiKey}
              className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm 
                         hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
              Erstellen
            </button>
            <button
              onClick={() => setIsCreatingProfile(false)}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm 
                         hover:bg-secondary/80 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Selected Profile Info */}
      {selectedProfile && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-primary">
            <User className="h-4 w-4" />
            <span className="font-medium">
              {profiles.find(p => p.id === selectedProfile)?.name}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Verwendet: {llmModels.find(m => m.id === profiles.find(p => p.id === selectedProfile)?.selectedModel)?.name}
          </p>
        </div>
      )}
    </div>
  )
}
