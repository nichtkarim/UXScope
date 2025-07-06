import { Profile } from '@/types'

const STORAGE_KEY = 'usability-tester-profiles'

export const profileStorage = {
  // Profile aus localStorage laden
  getProfiles(): Profile[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading profiles:', error)
      return []
    }
  },

  // Profile in localStorage speichern
  saveProfiles(profiles: Profile[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
    } catch (error) {
      console.error('Error saving profiles:', error)
    }
  },

  // Einzelnes Profil hinzufügen
  addProfile(profile: Omit<Profile, 'id' | 'createdAt'>): Profile {
    const profiles = this.getProfiles()
    const newProfile: Profile = {
      ...profile,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    profiles.push(newProfile)
    this.saveProfiles(profiles)
    return newProfile
  },

  // Profil aktualisieren
  updateProfile(id: string, updates: Partial<Profile>): Profile | null {
    const profiles = this.getProfiles()
    const index = profiles.findIndex(p => p.id === id)
    if (index === -1) return null
    
    const updatedProfile = { ...profiles[index], ...updates }
    profiles[index] = updatedProfile
    this.saveProfiles(profiles)
    return updatedProfile
  },

  // Profil löschen
  deleteProfile(id: string): boolean {
    const profiles = this.getProfiles()
    const filtered = profiles.filter(p => p.id !== id)
    if (filtered.length === profiles.length) return false
    
    this.saveProfiles(filtered)
    return true
  }
}

// Analyse-Historie
const HISTORY_KEY = 'usability-tester-history'

export interface AnalysisHistory {
  id: string
  timestamp: Date
  profileId: string
  contextDescription: string
  analysis: string
  imageName?: string
}

export const analysisHistory = {
  getHistory(): AnalysisHistory[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      return stored ? JSON.parse(stored).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })) : []
    } catch (error) {
      console.error('Error loading history:', error)
      return []
    }
  },

  addAnalysis(analysis: Omit<AnalysisHistory, 'id' | 'timestamp'>): AnalysisHistory {
    const history = this.getHistory()
    const newAnalysis: AnalysisHistory = {
      ...analysis,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    
    // Nur die letzten 50 Analysen behalten
    history.unshift(newAnalysis)
    if (history.length > 50) {
      history.splice(50)
    }
    
    this.saveHistory(history)
    return newAnalysis
  },

  saveHistory(history: AnalysisHistory[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch (error) {
      console.error('Error saving history:', error)
    }
  },

  deleteAnalysis(id: string): boolean {
    const history = this.getHistory()
    const filtered = history.filter(h => h.id !== id)
    if (filtered.length === history.length) return false
    
    this.saveHistory(filtered)
    return true
  }
}
