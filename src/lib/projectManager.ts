// 🎯 Multi-Surface Analysis Aggregator (MSAA) - Project Manager
// Storage und Management für Projekt-basierte Analyse-Sammlung

export interface AnalysisProject {
  projectId: string;
  projectName: string;
  projectDescription: string;
  createdAt: Date;
  lastModified: Date;
  analyses: string[]; // Array von Analysis IDs
  tags: string[];
  metadata: {
    totalAnalyses: number;
    lastAnalysisDate?: Date;
    projectStatus: 'active' | 'completed' | 'archived';
  };
}

export interface StoredAnalysis {
  analysisId: string;
  projectId?: string; // Optional - Analyse kann zu Projekt gehören oder einzeln sein
  surfaceName: string;        // "Login-Seite", "Dashboard", "Checkout"
  surfaceType: string;        // "Desktop", "Mobile", "Tablet"
  surfaceCategory: string;    // "Page", "Component", "Flow", "Feature"
  
  // Original Analyse-Daten (ExcelExportData kompatibel)
  analysisData: {
    titel: string;
    datum: string;
    zeit: string;
    exportId: string;
    promptVariante: string;
    promptSprache: string;
    llmModell: string;
    appOverview: string;
    eingegebenerCode: string;
    benutzerAufgabe: string;
    befunde: Array<{
      befundId: string;
      kategorie: string;
      schweregrad: string;
      titel: string;
      beschreibung: string;
      position: number;
    }>;
    vollstaendigeAnalyse: string;
    verarbeitungszeit: number;
    bildVorhanden: boolean;
    kontextVorhanden: boolean;
    visionUnterstuetzt: boolean;
  };
  
  // Meta-Daten
  createdAt: Date;
  tags: string[];
  notes: string;
}

export interface ProjectSummary {
  totalProjects: number;
  totalAnalyses: number;
  recentProjects: AnalysisProject[];
  topTags: string[];
}

// 💾 Storage Keys
const STORAGE_KEYS = {
  PROJECTS: 'uxscope_projects',
  ANALYSES: 'uxscope_analyses',
  SETTINGS: 'uxscope_project_settings'
} as const;

// 🎯 Project Manager Class
export class ProjectManager {
  
  // === PROJEKT CRUD OPERATIONEN ===
  
  static createProject(
    name: string, 
    description: string = '', 
    tags: string[] = []
  ): AnalysisProject {
    const projectId = this.generateProjectId();
    const project: AnalysisProject = {
      projectId,
      projectName: name,
      projectDescription: description,
      createdAt: new Date(),
      lastModified: new Date(),
      analyses: [],
      tags,
      metadata: {
        totalAnalyses: 0,
        projectStatus: 'active'
      }
    };
    
    this.saveProject(project);
    console.log(`🎯 Projekt "${name}" erstellt (ID: ${projectId})`);
    return project;
  }
  
  static getAllProjects(): AnalysisProject[] {
    try {
      const projectsJson = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!projectsJson) return [];
      
      const projects = JSON.parse(projectsJson);
      // Datums-Strings zurück zu Date-Objekten konvertieren
      return projects.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        lastModified: new Date(p.lastModified),
        metadata: {
          ...p.metadata,
          lastAnalysisDate: p.metadata.lastAnalysisDate ? new Date(p.metadata.lastAnalysisDate) : undefined
        }
      }));
    } catch (error) {
      console.error('❌ Fehler beim Laden der Projekte:', error);
      return [];
    }
  }
  
  static getProject(projectId: string): AnalysisProject | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.projectId === projectId) || null;
  }
  
  static saveProject(project: AnalysisProject): void {
    const projects = this.getAllProjects();
    const existingIndex = projects.findIndex(p => p.projectId === project.projectId);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = { ...project, lastModified: new Date() };
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    console.log(`💾 Projekt ${project.projectId} gespeichert`);
  }
  
  static deleteProject(projectId: string): boolean {
    try {
      // Projekt löschen
      const projects = this.getAllProjects();
      const filteredProjects = projects.filter(p => p.projectId !== projectId);
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filteredProjects));
      
      // Alle Analysen des Projekts löschen
      const analyses = this.getAllAnalyses();
      const filteredAnalyses = analyses.filter(a => a.projectId !== projectId);
      localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(filteredAnalyses));
      
      console.log(`🗑️ Projekt ${projectId} und alle zugehörigen Analysen gelöscht`);
      return true;
    } catch (error) {
      console.error('❌ Fehler beim Löschen des Projekts:', error);
      return false;
    }
  }
  
  // === ANALYSE CRUD OPERATIONEN ===
  
  static saveAnalysis(analysis: StoredAnalysis): void {
    const analyses = this.getAllAnalyses();
    const existingIndex = analyses.findIndex(a => a.analysisId === analysis.analysisId);
    
    if (existingIndex >= 0) {
      analyses[existingIndex] = analysis;
    } else {
      analyses.push(analysis);
    }
    
    localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(analyses));
    console.log(`💾 Analyse ${analysis.analysisId} gespeichert`);
  }
  
  static getAllAnalyses(): StoredAnalysis[] {
    try {
      const analysesJson = localStorage.getItem(STORAGE_KEYS.ANALYSES);
      if (!analysesJson) return [];
      
      const analyses = JSON.parse(analysesJson);
      // Datums-Strings zurück zu Date-Objekten konvertieren
      return analyses.map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt)
      }));
    } catch (error) {
      console.error('❌ Fehler beim Laden der Analysen:', error);
      return [];
    }
  }
  
  static getAnalysesByProject(projectId: string): StoredAnalysis[] {
    const analyses = this.getAllAnalyses();
    return analyses.filter(a => a.projectId === projectId);
  }
  
  static addAnalysisToProject(
    projectId: string, 
    analysisData: any, 
    surfaceName: string,
    surfaceType: string = 'Desktop',
    surfaceCategory: string = 'Page',
    tags: string[] = []
  ): StoredAnalysis {
    const analysis: StoredAnalysis = {
      analysisId: analysisData.exportId,
      projectId,
      surfaceName,
      surfaceType,
      surfaceCategory,
      analysisData,
      createdAt: new Date(),
      tags,
      notes: ''
    };
    
    // Analyse speichern
    this.saveAnalysis(analysis);
    
    // Projekt aktualisieren
    const project = this.getProject(projectId);
    if (project) {
      if (!project.analyses.includes(analysis.analysisId)) {
        project.analyses.push(analysis.analysisId);
      }
      project.metadata.totalAnalyses = project.analyses.length;
      project.metadata.lastAnalysisDate = new Date();
      this.saveProject(project);
    }
    
    console.log(`📊 Analyse "${surfaceName}" zu Projekt ${projectId} hinzugefügt`);
    return analysis;
  }
  
  // === UTILITY FUNKTIONEN ===
  
  static generateProjectId(): string {
    const now = new Date();
    const timestamp = now.getTime();
    const random = Math.random().toString(36).substring(2, 8);
    return `PROJ_${timestamp}_${random}`.toUpperCase();
  }
  
  static generateAnalysisId(): string {
    const now = new Date();
    const timestamp = now.getTime();
    const random = Math.random().toString(36).substring(2, 8);
    return `ANA_${timestamp}_${random}`.toUpperCase();
  }
  
  static getProjectSummary(): ProjectSummary {
    const projects = this.getAllProjects();
    const analyses = this.getAllAnalyses();
    
    // Top Tags sammeln
    const tagCounts: Record<string, number> = {};
    [...projects, ...analyses].forEach(item => {
      item.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
    
    // Neueste Projekte
    const recentProjects = projects
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
      .slice(0, 5);
    
    return {
      totalProjects: projects.length,
      totalAnalyses: analyses.length,
      recentProjects,
      topTags
    };
  }
  
  // === EXPORT UTILITIES ===
  
  static exportProjectData(projectId: string): string {
    const project = this.getProject(projectId);
    const analyses = this.getAnalysesByProject(projectId);
    
    return JSON.stringify({
      project,
      analyses,
      exportedAt: new Date(),
      version: '1.0'
    }, null, 2);
  }
  
  static importProjectData(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.project && importData.analyses) {
        // Projekt importieren
        this.saveProject(importData.project);
        
        // Analysen importieren
        importData.analyses.forEach((analysis: StoredAnalysis) => {
          this.saveAnalysis(analysis);
        });
        
        console.log(`📥 Projekt "${importData.project.projectName}" erfolgreich importiert`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Fehler beim Importieren der Projekt-Daten:', error);
      return false;
    }
  }
  
  // === STORAGE MANAGEMENT ===
  
  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.ANALYSES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    console.log('🧹 Alle MSAA-Daten gelöscht');
  }
  
  static getStorageSize(): { projects: number; analyses: number; total: number } {
    const projectsSize = localStorage.getItem(STORAGE_KEYS.PROJECTS)?.length || 0;
    const analysesSize = localStorage.getItem(STORAGE_KEYS.ANALYSES)?.length || 0;
    
    return {
      projects: projectsSize,
      analyses: analysesSize,
      total: projectsSize + analysesSize
    };
  }
}

// 🚀 Debug Utilities (nur für Development)
export const DebugUtils = {
  createTestProject: () => {
    const project = ProjectManager.createProject(
      'E-Commerce Redesign',
      'Vollständige UX-Überarbeitung der Online-Shop-Oberfläche',
      ['e-commerce', 'redesign', 'mobile-first']
    );
    console.log('🧪 Test-Projekt erstellt:', project);
    return project;
  },
  
  logStorageContents: () => {
    console.log('📊 Storage Contents:');
    console.log('Projects:', ProjectManager.getAllProjects());
    console.log('Analyses:', ProjectManager.getAllAnalyses());
    console.log('Summary:', ProjectManager.getProjectSummary());
    console.log('Storage Size:', ProjectManager.getStorageSize());
  }
};
