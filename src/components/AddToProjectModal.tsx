// 🎯 Add to Project Modal - Analyse zu Projekt hinzufügen
'use client';

import React, { useState, useEffect } from 'react';
import { ProjectManager, AnalysisProject } from '../lib/projectManager';

interface AddToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: any; // ExcelExportData kompatibel
  onSuccess?: (projectId: string, surfaceName: string) => void;
}

export function AddToProjectModal({ isOpen, onClose, analysisData, onSuccess }: AddToProjectModalProps) {
  const [projects, setProjects] = useState<AnalysisProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [surfaceForm, setSurfaceForm] = useState({
    name: '',
    type: 'Desktop',
    category: 'Page',
    tags: ''
  });
  const [createNewProject, setCreateNewProject] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    description: '',
    tags: ''
  });

  useEffect(() => {
    if (isOpen) {
      setProjects(ProjectManager.getAllProjects());
      // Automatisch Namen vorschlagen basierend auf Analyse-Daten
      if (analysisData?.titel) {
        setSurfaceForm(prev => ({
          ...prev,
          name: analysisData.titel.replace('Usability-Analyse ', '') || 'Neue Oberfläche'
        }));
      }
    }
  }, [isOpen, analysisData]);

  const handleAddToProject = () => {
    if (!selectedProjectId && !createNewProject) {
      alert('❌ Bitte wähle ein Projekt aus oder erstelle ein neues!');
      return;
    }

    if (!surfaceForm.name.trim()) {
      alert('❌ Name der Oberfläche ist erforderlich!');
      return;
    }

    try {
      let projectId = selectedProjectId;

      // Neues Projekt erstellen falls nötig
      if (createNewProject) {
        if (!newProjectForm.name.trim()) {
          alert('❌ Projektname ist erforderlich!');
          return;
        }

        const tags = newProjectForm.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);

        const newProject = ProjectManager.createProject(
          newProjectForm.name,
          newProjectForm.description,
          tags
        );
        projectId = newProject.projectId;
      }

      // Analyse zu Projekt hinzufügen
      const surfaceTags = surfaceForm.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const storedAnalysis = ProjectManager.addAnalysisToProject(
        projectId,
        analysisData,
        surfaceForm.name,
        surfaceForm.type,
        surfaceForm.category,
        surfaceTags
      );

      // Erfolg
      alert(`✅ Analyse "${surfaceForm.name}" erfolgreich zu Projekt hinzugefügt!`);
      onSuccess?.(projectId, surfaceForm.name);
      onClose();

      // Forms zurücksetzen
      setSurfaceForm({ name: '', type: 'Desktop', category: 'Page', tags: '' });
      setNewProjectForm({ name: '', description: '', tags: '' });
      setSelectedProjectId('');
      setCreateNewProject(false);

    } catch (error) {
      console.error('Fehler beim Hinzufügen zur Projekt:', error);
      alert('❌ Fehler beim Hinzufügen zur Projekt!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              📁 Analyse zu Projekt hinzufügen
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Sammle Analysen für umfassende Projekt-Insights
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Analyse-Info */}
          {analysisData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                📊 Analyse-Informationen
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Titel:</span>
                  <div className="font-medium">{analysisData.titel}</div>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Befunde:</span>
                  <div className="font-medium">{analysisData.befunde?.length || 0}</div>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Variante:</span>
                  <div className="font-medium">{analysisData.promptVariante}</div>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Datum:</span>
                  <div className="font-medium">{analysisData.datum}</div>
                </div>
              </div>
            </div>
          )}

          {/* Projekt auswählen */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              🎯 Projekt auswählen
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="existing-project"
                  name="project-choice"
                  checked={!createNewProject}
                  onChange={() => setCreateNewProject(false)}
                  className="mr-2"
                />
                <label htmlFor="existing-project" className="text-gray-900 dark:text-white">
                  Vorhandenes Projekt verwenden
                </label>
              </div>

              {!createNewProject && (
                <div className="ml-6">
                  {projects.length === 0 ? (
                    <div className="text-gray-500 dark:text-gray-400 italic">
                      Keine Projekte vorhanden. Erstelle ein neues Projekt.
                    </div>
                  ) : (
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">-- Projekt auswählen --</option>
                      {projects.map(project => (
                        <option key={project.projectId} value={project.projectId}>
                          {project.projectName} ({project.analyses.length} Analysen)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="radio"
                  id="new-project"
                  name="project-choice"
                  checked={createNewProject}
                  onChange={() => setCreateNewProject(true)}
                  className="mr-2"
                />
                <label htmlFor="new-project" className="text-gray-900 dark:text-white">
                  Neues Projekt erstellen
                </label>
              </div>

              {createNewProject && (
                <div className="ml-6 space-y-3">
                  <input
                    type="text"
                    value={newProjectForm.name}
                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Projektname"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <textarea
                    value={newProjectForm.description}
                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Projektbeschreibung (optional)"
                    rows={2}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={newProjectForm.tags}
                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Tags (kommagetrennt)"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Oberflächen-Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              🖥️ Oberflächen-Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name der Oberfläche *
                </label>
                <input
                  type="text"
                  value={surfaceForm.name}
                  onChange={(e) => setSurfaceForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="z.B. Login-Seite, Dashboard, Checkout"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gerätetyp
                </label>
                <select
                  value={surfaceForm.type}
                  onChange={(e) => setSurfaceForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Desktop">🖥️ Desktop</option>
                  <option value="Mobile">📱 Mobile</option>
                  <option value="Tablet">📟 Tablet</option>
                  <option value="Responsive">🔄 Responsive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategorie
                </label>
                <select
                  value={surfaceForm.category}
                  onChange={(e) => setSurfaceForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Page">📄 Seite</option>
                  <option value="Component">🧩 Komponente</option>
                  <option value="Flow">🔄 User Flow</option>
                  <option value="Feature">⭐ Feature</option>
                  <option value="Layout">📐 Layout</option>
                  <option value="Navigation">🧭 Navigation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (optional)
                </label>
                <input
                  type="text"
                  value={surfaceForm.tags}
                  onChange={(e) => setSurfaceForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="kritisch, login, responsive"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleAddToProject}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              📁 Zu Projekt hinzufügen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
