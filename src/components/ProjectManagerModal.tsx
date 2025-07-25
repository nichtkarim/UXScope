// 🎯 Project Manager Modal - UI für Multi-Surface Analysis Aggregator
'use client';

import React, { useState, useEffect } from 'react';
import { ProjectManager, AnalysisProject, StoredAnalysis, ProjectSummary } from '../lib/projectManager';
import { exportAggregatedExcel } from '../lib/aggregatedExport';
import { exportConsolidatedReport, exportConsolidatedReportAsHTML } from '../lib/consolidatedReport';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelect?: (projectId: string) => void;
}

export function ProjectManagerModal({ isOpen, onClose, onProjectSelect }: ProjectManagerModalProps) {
  const [projects, setProjects] = useState<AnalysisProject[]>([]);
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'create'>('overview');
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    description: '',
    tags: ''
  });

  // Daten laden
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    setProjects(ProjectManager.getAllProjects());
    setSummary(ProjectManager.getProjectSummary());
  };

  const handleCreateProject = () => {
    if (!newProjectForm.name.trim()) {
      alert('❌ Projektname ist erforderlich!');
      return;
    }

    const tags = newProjectForm.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const project = ProjectManager.createProject(
      newProjectForm.name,
      newProjectForm.description,
      tags
    );

    setNewProjectForm({ name: '', description: '', tags: '' });
    loadData();
    alert(`✅ Projekt "${project.projectName}" erfolgreich erstellt!`);
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.projectId === projectId);
    if (!project) return;

    if (confirm(`⚠️ Projekt "${project.projectName}" wirklich löschen?\n\nAlle zugehörigen Analysen gehen verloren!`)) {
      ProjectManager.deleteProject(projectId);
      loadData();
      alert('🗑️ Projekt gelöscht!');
    }
  };

  const handleExportProject = (projectId: string) => {
    const project = projects.find(p => p.projectId === projectId);
    if (!project) return;

    try {
      const exportData = ProjectManager.exportProjectData(projectId);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `UXScope_Project_${project.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      alert('📦 Projekt-Export erfolgreich!');
    } catch (error) {
      alert('❌ Export fehlgeschlagen!');
    }
  };

  const handleAggregatedExcelExport = (projectId: string) => {
    const project = projects.find(p => p.projectId === projectId);
    if (!project) return;

    const analyses = ProjectManager.getAnalysesByProject(projectId);
    if (analyses.length === 0) {
      alert('⚠️ Keine Analysen im Projekt vorhanden!');
      return;
    }

    try {
      exportAggregatedExcel(projectId);
    } catch (error) {
      console.error('Aggregated Excel Export Fehler:', error);
      alert('❌ Aggregated Excel Export fehlgeschlagen!');
    }
  };

  const handleConsolidatedReport = (projectId: string, format: 'markdown' | 'html') => {
    const project = projects.find(p => p.projectId === projectId);
    if (!project) return;

    const analyses = ProjectManager.getAnalysesByProject(projectId);
    if (analyses.length === 0) {
      alert('⚠️ Keine Analysen im Projekt vorhanden!');
      return;
    }

    try {
      if (format === 'html') {
        exportConsolidatedReportAsHTML(projectId);
      } else {
        exportConsolidatedReport(projectId);
      }
    } catch (error) {
      console.error('Consolidated Report Export Fehler:', error);
      alert('❌ Consolidated Report Export fehlgeschlagen!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🎯 Project Manager (MSAA)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Multi-Surface Analysis Aggregator
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: '📊 Übersicht', icon: '📊' },
            { id: 'projects', label: '📂 Projekte', icon: '📂' },
            { id: 'create', label: '➕ Erstellen', icon: '➕' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          
          {/* Übersicht Tab */}
          {activeTab === 'overview' && summary && (
            <div className="space-y-6">
              
              {/* Statistiken */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {summary.totalProjects}
                  </div>
                  <div className="text-blue-800 dark:text-blue-300">Projekte</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {summary.totalAnalyses}
                  </div>
                  <div className="text-green-800 dark:text-green-300">Analysen</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {summary.totalAnalyses > 0 ? (summary.totalAnalyses / summary.totalProjects).toFixed(1) : '0'}
                  </div>
                  <div className="text-purple-800 dark:text-purple-300">Ø Analysen/Projekt</div>
                </div>
              </div>

              {/* Neueste Projekte */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  📈 Neueste Projekte
                </h3>
                <div className="space-y-2">
                  {summary.recentProjects.map(project => (
                    <div key={project.projectId} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {project.projectName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {project.analyses.length} Analysen • Erstellt: {project.createdAt.toLocaleDateString('de-DE')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedProject(project.projectId);
                            setActiveTab('projects');
                          }}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          👁️ Anzeigen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Tags */}
              {summary.topTags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    🏷️ Häufige Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.topTags.map(tag => (
                      <span key={tag} className="bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-full text-sm text-gray-700 dark:text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Projekte Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📂</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Keine Projekte vorhanden
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Erstelle dein erstes Projekt, um Analysen zu sammeln!
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ➕ Erstes Projekt erstellen
                  </button>
                </div>
              ) : (
                projects.map(project => (
                  <div key={project.projectId} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {project.projectName}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {project.projectDescription || 'Keine Beschreibung'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAggregatedExcelExport(project.projectId)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="📊 Aggregated Excel Export (alle Analysen)"
                        >
                          📊
                        </button>
                        <button
                          onClick={() => handleConsolidatedReport(project.projectId, 'html')}
                          className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                          title="🌐 HTML Consolidated Report"
                        >
                          🌐
                        </button>
                        <button
                          onClick={() => handleConsolidatedReport(project.projectId, 'markdown')}
                          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="📄 Markdown Consolidated Report"
                        >
                          📄
                        </button>
                        <button
                          onClick={() => handleExportProject(project.projectId)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="📦 Projekt-Daten exportieren (JSON)"
                        >
                          📦
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.projectId)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="🗑️ Projekt löschen"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Analysen:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {project.analyses.length}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {project.metadata.projectStatus === 'active' ? '🟢 Aktiv' : 
                           project.metadata.projectStatus === 'completed' ? '✅ Abgeschlossen' : 
                           '📦 Archiviert'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Erstellt:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {project.createdAt.toLocaleDateString('de-DE')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Geändert:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {project.lastModified.toLocaleDateString('de-DE')}
                        </div>
                      </div>
                    </div>

                    {project.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {project.tags.map(tag => (
                          <span key={tag} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {onProjectSelect && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={() => {
                              onProjectSelect(project.projectId);
                              onClose();
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                          >
                            📊 Für neue Analyse auswählen
                          </button>
                        </div>
                        
                        {project.analyses.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              🎯 Multi-Surface Exports:
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleAggregatedExcelExport(project.projectId)}
                                className="bg-emerald-600 text-white px-3 py-2 rounded hover:bg-emerald-700 transition-colors text-xs font-medium"
                              >
                                📊 Excel Export
                              </button>
                              <button
                                onClick={() => handleConsolidatedReport(project.projectId, 'html')}
                                className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition-colors text-xs font-medium"
                              >
                                � HTML Report
                              </button>
                              <button
                                onClick={() => handleConsolidatedReport(project.projectId, 'markdown')}
                                className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 transition-colors text-xs font-medium"
                              >
                                📄 MD Report
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Erstellen Tab */}
          {activeTab === 'create' && (
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                ➕ Neues Projekt erstellen
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Projektname *
                  </label>
                  <input
                    type="text"
                    value={newProjectForm.name}
                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="z.B. E-Commerce Redesign"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    value={newProjectForm.description}
                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Kurze Beschreibung des Projekts..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (kommagetrennt)
                  </label>
                  <input
                    type="text"
                    value={newProjectForm.tags}
                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e-commerce, mobile, redesign"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <button
                  onClick={handleCreateProject}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  🎯 Projekt erstellen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
