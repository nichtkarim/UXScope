// 🎯 Aggregated Excel Export - Multi-Surface Analysis Aggregator (MSAA)
// Exportiert mehrere Analysen eines Projekts in einem umfassenden Excel-File

import * as XLSX from 'xlsx';
import { ProjectManager, AnalysisProject, StoredAnalysis } from './projectManager';
import { ExcelExportData } from './excelExport';

export interface AggregatedExportData {
  // Projekt-Meta-Informationen
  projectInfo: {
    projectId: string;
    projectName: string;
    projectDescription: string;
    totalAnalyses: number;
    dateRange: {
      earliest: string;
      latest: string;
    };
    exportDate: string;
    exportId: string;
  };
  
  // Alle Analysen des Projekts
  analyses: StoredAnalysis[];
  
  // Cross-Surface Insights
  crossSurfaceAnalysis: {
    totalBefunde: number;
    commonProblems: Array<{
      problem: string;
      occurrences: number;
      surfaces: string[];
      severity: string;
    }>;
    severityDistribution: Record<string, number>;
    surfaceComparison: Array<{
      surfaceName: string;
      surfaceType: string;
      befundeCount: number;
      criticalIssues: number;
      averageSeverity: string;
    }>;
    trends: {
      improvingAreas: string[];
      worseningAreas: string[];
    };
  };
  
  // Projekt-Statistiken
  projectStats: {
    promptVariantsUsed: string[];
    llmModelsUsed: string[];
    surfaceTypes: Record<string, number>;
    surfaceCategories: Record<string, number>;
    totalProcessingTime: number;
    analysisEfficiency: number; // Befunde pro Minute
  };
}

// 🧠 Cross-Surface Analysis Engine
export class CrossSurfaceAnalyzer {
  
  static analyzeProject(projectId: string): AggregatedExportData {
    const project = ProjectManager.getProject(projectId);
    const analyses = ProjectManager.getAnalysesByProject(projectId);
    
    if (!project || analyses.length === 0) {
      throw new Error(`Projekt ${projectId} nicht gefunden oder leer`);
    }
    
    console.log(`🔍 Analysiere Projekt "${project.projectName}" mit ${analyses.length} Analysen...`);
    
    // Cross-Surface Analysis durchführen
    const crossAnalysis = this.performCrossSurfaceAnalysis(analyses);
    const projectStats = this.calculateProjectStats(analyses);
    
    // Datum-Range ermitteln
    const dates = analyses.map(a => a.createdAt).sort((a, b) => a.getTime() - b.getTime());
    const dateRange = {
      earliest: dates[0]?.toLocaleDateString('de-DE') || 'Unbekannt',
      latest: dates[dates.length - 1]?.toLocaleDateString('de-DE') || 'Unbekannt'
    };
    
    const exportId = `AGG_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
    
    return {
      projectInfo: {
        projectId: project.projectId,
        projectName: project.projectName,
        projectDescription: project.projectDescription,
        totalAnalyses: analyses.length,
        dateRange,
        exportDate: new Date().toLocaleDateString('de-DE'),
        exportId
      },
      analyses,
      crossSurfaceAnalysis: crossAnalysis,
      projectStats
    };
  }
  
  private static performCrossSurfaceAnalysis(analyses: StoredAnalysis[]) {
    const allBefunde = analyses.flatMap(analysis => 
      analysis.analysisData.befunde.map(befund => ({
        ...befund,
        surfaceName: analysis.surfaceName,
        surfaceType: analysis.surfaceType,
        analysisId: analysis.analysisId
      }))
    );
    
    // Häufige Probleme erkennen (basierend auf ähnlichen Titeln/Beschreibungen)
    const commonProblems = this.detectCommonProblems(allBefunde);
    
    // Schweregrad-Verteilung
    const severityDistribution = allBefunde.reduce((acc, befund) => {
      acc[befund.schweregrad] = (acc[befund.schweregrad] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Oberflächen-Vergleich
    const surfaceComparison = this.compareSurfaces(analyses);
    
    // Trends (vereinfacht - basierend auf Chronologie)
    const trends = this.analyzeTrends(analyses);
    
    return {
      totalBefunde: allBefunde.length,
      commonProblems,
      severityDistribution,
      surfaceComparison,
      trends
    };
  }
  
  private static detectCommonProblems(befunde: any[]) {
    // Gruppiere ähnliche Probleme basierend auf Keywords in Titel/Beschreibung
    const problemGroups: Record<string, any[]> = {};
    
    const keywords = [
      'navigation', 'button', 'text', 'color', 'contrast', 'layout', 'mobile', 
      'responsive', 'accessibility', 'loading', 'error', 'form', 'validation',
      'usability', 'user', 'interface', 'design', 'functionality'
    ];
    
    befunde.forEach(befund => {
      const text = `${befund.titel} ${befund.beschreibung}`.toLowerCase();
      
      // Finde relevante Keywords
      const foundKeywords = keywords.filter(keyword => text.includes(keyword));
      
      if (foundKeywords.length > 0) {
        const primaryKeyword = foundKeywords[0]; // Nehme das erste gefundene Keyword
        if (!problemGroups[primaryKeyword]) {
          problemGroups[primaryKeyword] = [];
        }
        problemGroups[primaryKeyword].push(befund);
      }
    });
    
    // Konvertiere zu common problems Format
    return Object.entries(problemGroups)
      .filter(([, group]) => group.length > 1) // Nur Probleme die mehrfach auftreten
      .map(([keyword, group]) => ({
        problem: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}-bezogene Probleme`,
        occurrences: group.length,
        surfaces: [...new Set(group.map(b => b.surfaceName))],
        severity: this.getMostCommonSeverity(group)
      }))
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10); // Top 10 häufigste Probleme
  }
  
  private static getMostCommonSeverity(befunde: any[]): string {
    const severityCounts = befunde.reduce((acc, b) => {
      acc[b.schweregrad] = (acc[b.schweregrad] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(severityCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'unknown';
  }
  
  private static compareSurfaces(analyses: StoredAnalysis[]) {
    return analyses.map(analysis => {
      const befunde = analysis.analysisData.befunde;
      const criticalIssues = befunde.filter(b => 
        ['critical', 'catastrophic', 'serious'].includes(b.schweregrad)
      ).length;
      
      // Durchschnittlicher Schweregrad (vereinfacht)
      const severityScores: Record<string, number> = { 
        'catastrophic': 5, 'critical': 4, 'serious': 3, 'minor': 2, 'positive': 1, 'Nicht bewertet': 0 
      };
      const avgScore = befunde.length > 0 
        ? befunde.reduce((sum, b) => sum + (severityScores[b.schweregrad] || 0), 0) / befunde.length
        : 0;
      
      const avgSeverity = avgScore >= 4 ? 'Hoch' : avgScore >= 2.5 ? 'Mittel' : 'Niedrig';
      
      return {
        surfaceName: analysis.surfaceName,
        surfaceType: analysis.surfaceType,
        befundeCount: befunde.length,
        criticalIssues,
        averageSeverity: avgSeverity
      };
    });
  }
  
  private static analyzeTrends(analyses: StoredAnalysis[]) {
    // Sortiere Analysen chronologisch
    const sortedAnalyses = [...analyses].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // Vereinfachte Trend-Analyse basierend auf Anzahl kritischer Probleme über Zeit
    const improvingAreas: string[] = [];
    const worseningAreas: string[] = [];
    
    if (sortedAnalyses.length >= 2) {
      const early = sortedAnalyses.slice(0, Math.ceil(sortedAnalyses.length / 2));
      const recent = sortedAnalyses.slice(Math.floor(sortedAnalyses.length / 2));
      
      const earlyCritical = early.reduce((sum, a) => 
        sum + a.analysisData.befunde.filter(b => ['critical', 'catastrophic'].includes(b.schweregrad)).length, 0
      ) / early.length;
      
      const recentCritical = recent.reduce((sum, a) => 
        sum + a.analysisData.befunde.filter(b => ['critical', 'catastrophic'].includes(b.schweregrad)).length, 0
      ) / recent.length;
      
      if (recentCritical < earlyCritical) {
        improvingAreas.push('Kritische Probleme reduziert');
      } else if (recentCritical > earlyCritical) {
        worseningAreas.push('Kritische Probleme gestiegen');
      }
    }
    
    return { improvingAreas, worseningAreas };
  }
  
  private static calculateProjectStats(analyses: StoredAnalysis[]) {
    const promptVariants = [...new Set(analyses.map(a => a.analysisData.promptVariante))];
    const llmModels = [...new Set(analyses.map(a => a.analysisData.llmModell))];
    
    const surfaceTypes = analyses.reduce((acc, a) => {
      acc[a.surfaceType] = (acc[a.surfaceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const surfaceCategories = analyses.reduce((acc, a) => {
      acc[a.surfaceCategory] = (acc[a.surfaceCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalProcessingTime = analyses.reduce((sum, a) => sum + a.analysisData.verarbeitungszeit, 0);
    const totalBefunde = analyses.reduce((sum, a) => sum + a.analysisData.befunde.length, 0);
    const analysisEfficiency = totalProcessingTime > 0 
      ? Math.round((totalBefunde / (totalProcessingTime / 60000)) * 100) / 100 // Befunde pro Minute
      : 0;
    
    return {
      promptVariantsUsed: promptVariants,
      llmModelsUsed: llmModels,
      surfaceTypes,
      surfaceCategories,
      totalProcessingTime,
      analysisEfficiency
    };
  }
}

// 📊 Aggregated Excel Workbook Creator
export function createAggregatedExcelWorkbook(data: AggregatedExportData): XLSX.WorkBook {
  console.log(`📊 Erstelle Aggregated Excel für Projekt "${data.projectInfo.projectName}"...`);
  
  const workbook = XLSX.utils.book_new();
  
  // === 1. PROJEKT-ÜBERSICHT ===
  const overviewData = [
    ['PROJEKT-ANALYSE ÜBERSICHT'],
    [''],
    ['PROJEKT-INFORMATIONEN'],
    ['Projektname', data.projectInfo.projectName],
    ['Projekt ID', data.projectInfo.projectId],
    ['Beschreibung', data.projectInfo.projectDescription || 'Keine Beschreibung'],
    ['Export-Datum', data.projectInfo.exportDate],
    ['Export-ID', data.projectInfo.exportId],
    [''],
    ['ANALYSE-STATISTIKEN'],
    ['Gesamtanzahl Analysen', data.projectInfo.totalAnalyses],
    ['Gesamtanzahl Befunde', data.crossSurfaceAnalysis.totalBefunde],
    ['Zeitraum (von)', data.projectInfo.dateRange.earliest],
    ['Zeitraum (bis)', data.projectInfo.dateRange.latest],
    [''],
    ['EFFIZIENZ-METRIKEN'],
    ['Gesamte Verarbeitungszeit (ms)', data.projectStats.totalProcessingTime],
    ['Analyse-Effizienz (Befunde/Min)', data.projectStats.analysisEfficiency],
    ['Ø Befunde pro Analyse', Math.round(data.crossSurfaceAnalysis.totalBefunde / data.projectInfo.totalAnalyses * 100) / 100],
    [''],
    ['VERWENDETE TECHNOLOGIEN'],
    ['Prompt-Varianten', data.projectStats.promptVariantsUsed.join(', ')],
    ['LLM-Modelle', data.projectStats.llmModelsUsed.join(', ')]
  ];
  
  const overviewWS = XLSX.utils.aoa_to_sheet(overviewData);
  overviewWS['!cols'] = [{ wch: 30 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(workbook, overviewWS, '📊 Projekt-Übersicht');
  
  // === 2. PROJEKT-KONTEXT (NEU) ===
  const contextData = [
    ['PROJEKT-KONTEXT & EINGABEN'],
    [''],
    ['KONTEXT-INFORMATIONEN AUS ALLEN ANALYSEN']
  ];
  
  // Sammle alle einzigartigen Kontext-Informationen
  const allAppOverviews = [...new Set(data.analyses.map(a => a.analysisData.appOverview).filter(Boolean))];
  const allUserTasks = [...new Set(data.analyses.map(a => a.analysisData.benutzerAufgabe).filter(Boolean))];
  const allCodeInputs = [...new Set(data.analyses.map(a => a.analysisData.eingegebenerCode).filter(code => code && code !== 'Kein Code eingegeben'))];
  
  // App-Übersichten hinzufügen
  if (allAppOverviews.length > 0) {
    contextData.push([''], ['APP-ÜBERSICHTEN']);
    allAppOverviews.forEach((overview, index) => {
      contextData.push([`App-Übersicht ${index + 1}`, overview]);
    });
  }
  
  // Benutzeraufgaben hinzufügen
  if (allUserTasks.length > 0) {
    contextData.push([''], ['BENUTZERAUFGABEN']);
    allUserTasks.forEach((task, index) => {
      contextData.push([`Benutzeraufgabe ${index + 1}`, task]);
    });
  }
  
  // Code-Eingaben hinzufügen
  if (allCodeInputs.length > 0) {
    contextData.push([''], ['QUELLCODE-EINGABEN']);
    allCodeInputs.forEach((code, index) => {
      contextData.push([`Code-Eingabe ${index + 1}`, code]);
    });
  }
  
  // Falls keine Kontextdaten vorhanden
  if (allAppOverviews.length === 0 && allUserTasks.length === 0 && allCodeInputs.length === 0) {
    contextData.push([''], ['Hinweis', 'Keine spezifischen Kontext-Eingaben in den Analysen gefunden.']);
  }
  
  const contextWS = XLSX.utils.aoa_to_sheet(contextData);
  contextWS['!cols'] = [{ wch: 25 }, { wch: 100 }]; // Label-Spalte und breite Inhalt-Spalte
  XLSX.utils.book_append_sheet(workbook, contextWS, '📋 Projekt-Kontext');
  
  // === 3. CROSS-SURFACE ANALYSE ===
  const crossData = [
    ['CROSS-SURFACE ANALYSE'],
    [''],
    ['HÄUFIGE PROBLEME ÜBER ALLE OBERFLÄCHEN'],
    ['Problem-Typ', 'Häufigkeit', 'Betroffene Oberflächen', 'Häufigster Schweregrad']
  ];
  
  data.crossSurfaceAnalysis.commonProblems.forEach(problem => {
    crossData.push([
      problem.problem,
      problem.occurrences.toString(),
      problem.surfaces.join(', '),
      problem.severity
    ]);
  });
  
  crossData.push(
    [''],
    ['SCHWEREGRAD-VERTEILUNG (GESAMT)'],
    ['Schweregrad', 'Anzahl', 'Prozent']
  );
  
  const totalBefunde = data.crossSurfaceAnalysis.totalBefunde;
  Object.entries(data.crossSurfaceAnalysis.severityDistribution).forEach(([severity, count]) => {
    const percent = totalBefunde > 0 ? ((count / totalBefunde) * 100).toFixed(1) : '0';
    crossData.push([severity, count.toString(), `${percent}%`]);
  });
  
  const crossWS = XLSX.utils.aoa_to_sheet(crossData);
  crossWS['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 40 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, crossWS, '🔍 Cross-Surface Analyse');
  
  // === 4. OBERFLÄCHEN-VERGLEICH ===
  const comparisonData = [
    ['OBERFLÄCHEN-VERGLEICH'],
    [''],
    ['Oberfläche', 'Typ', 'Befunde (Gesamt)', 'Kritische Probleme', 'Ø Schweregrad']
  ];
  
  data.crossSurfaceAnalysis.surfaceComparison.forEach(surface => {
    comparisonData.push([
      surface.surfaceName,
      surface.surfaceType,
      surface.befundeCount.toString(),
      surface.criticalIssues.toString(),
      surface.averageSeverity
    ]);
  });
  
  const comparisonWS = XLSX.utils.aoa_to_sheet(comparisonData);
  comparisonWS['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, comparisonWS, '📈 Oberflächen-Vergleich');
  
  // === 5. ALLE BEFUNDE KONSOLIDIERT ===
  const befundeData = [
    ['ALLE BEFUNDE (KONSOLIDIERT)'],
    [''],
    ['Oberfläche', 'Typ', 'Befund-ID', 'Kategorie', 'Schweregrad', 'Titel', 'Beschreibung']
  ];
  
  data.analyses.forEach(analysis => {
    analysis.analysisData.befunde.forEach(befund => {
      befundeData.push([
        analysis.surfaceName,
        analysis.surfaceType,
        befund.befundId,
        befund.kategorie,
        befund.schweregrad,
        befund.titel,
        befund.beschreibung
      ]);
    });
  });
  
  const befundeWS = XLSX.utils.aoa_to_sheet(befundeData);
  befundeWS['!cols'] = [
    { wch: 25 }, // Oberfläche
    { wch: 12 }, // Typ
    { wch: 25 }, // Befund-ID
    { wch: 15 }, // Kategorie
    { wch: 15 }, // Schweregrad
    { wch: 30 }, // Titel
    { wch: 80 }  // Beschreibung
  ];
  XLSX.utils.book_append_sheet(workbook, befundeWS, '📋 Alle Befunde');
  
  // === 6. EINZELNE ANALYSEN (als separate Sheets) ===
  data.analyses.forEach((analysis, index) => {
    const analysisData = [
      [`ANALYSE: ${analysis.surfaceName}`],
      [''],
      ['META-INFORMATIONEN'],
      ['Oberfläche', analysis.surfaceName],
      ['Typ', analysis.surfaceType],
      ['Kategorie', analysis.surfaceCategory],
      ['Erstellt am', analysis.createdAt.toLocaleDateString('de-DE')],
      ['Tags', analysis.tags.join(', ')],
      [''],
      ['ANALYSE-DETAILS'],
      ['Titel', analysis.analysisData.titel],
      ['Prompt-Variante', analysis.analysisData.promptVariante],
      ['LLM-Modell', analysis.analysisData.llmModell],
      ['Verarbeitungszeit (ms)', analysis.analysisData.verarbeitungszeit],
      [''],
      ['KONTEXT-EINGABEN'],
      ['App-Übersicht', analysis.analysisData.appOverview || 'Keine Angabe'],
      ['Benutzeraufgabe', analysis.analysisData.benutzerAufgabe || 'Keine Angabe'],
      ['Quellcode-Eingabe', analysis.analysisData.eingegebenerCode || 'Kein Code eingegeben'],
      [''],
      ['BEFUNDE'],
      ['Befund-ID', 'Kategorie', 'Schweregrad', 'Titel', 'Beschreibung']
    ];
    
    analysis.analysisData.befunde.forEach(befund => {
      analysisData.push([
        befund.befundId,
        befund.kategorie,
        befund.schweregrad,
        befund.titel,
        befund.beschreibung
      ]);
    });
    
    const analysisWS = XLSX.utils.aoa_to_sheet(analysisData);
    analysisWS['!cols'] = [
      { wch: 25 }, // Befund-ID / Labels
      { wch: 15 }, // Kategorie
      { wch: 15 }, // Schweregrad
      { wch: 30 }, // Titel
      { wch: 80 }  // Beschreibung / Werte
    ];
    
    // Sheet-Name kürzen falls nötig (Excel-Limit: 31 Zeichen)
    const sheetName = analysis.surfaceName.length > 25 
      ? `${analysis.surfaceName.substring(0, 22)}...`
      : analysis.surfaceName;
    
    XLSX.utils.book_append_sheet(workbook, analysisWS, `${index + 1}. ${sheetName}`);
  });
  
  console.log(`✅ Aggregated Excel mit ${workbook.SheetNames.length} Arbeitsblättern erstellt`);
  return workbook;
}

// 🚀 Main Export Function
export function exportAggregatedExcel(projectId: string): void {
  try {
    console.log(`🚀 Starte Aggregated Excel Export für Projekt ${projectId}...`);
    
    // Projekt-Daten analysieren
    const aggregatedData = CrossSurfaceAnalyzer.analyzeProject(projectId);
    
    // Excel-Workbook erstellen
    const workbook = createAggregatedExcelWorkbook(aggregatedData);
    
    // Dateiname generieren
    const safeProjectName = aggregatedData.projectInfo.projectName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Projekt_${safeProjectName}_Aggregated_${aggregatedData.projectInfo.exportId}.xlsx`;
    
    // Download starten
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      compression: true 
    });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    // Erfolgs-Feedback
    alert(`🎯 Aggregated Excel Export erfolgreich!\n\n` +
          `Projekt: ${aggregatedData.projectInfo.projectName}\n` +
          `Datei: ${filename}\n\n` +
          `Inhalt:\n` +
          `• ${aggregatedData.projectInfo.totalAnalyses} Analysen\n` +
          `• ${aggregatedData.crossSurfaceAnalysis.totalBefunde} Befunde\n` +
          `• ${workbook.SheetNames.length} Arbeitsblätter\n` +
          `• Cross-Surface Analyse\n` +
          `• Trend-Analyse\n\n` +
          `Die Datei wurde heruntergeladen.`);
    
    console.log(`✅ Aggregated Excel Export abgeschlossen: ${filename}`);
    
  } catch (error) {
    console.error('❌ Aggregated Excel Export Fehler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    alert(`❌ Aggregated Excel Export fehlgeschlagen!\n\nFehler: ${errorMessage}`);
  }
}
