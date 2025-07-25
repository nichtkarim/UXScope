// 🎯 Consolidated Report Generator - Multi-Surface Analysis Aggregator (MSAA)
// Erstellt zusammengefasste Text-Berichte für Projekte

import { ProjectManager, AnalysisProject, StoredAnalysis } from './projectManager';
import { CrossSurfaceAnalyzer, AggregatedExportData } from './aggregatedExport';

export interface ConsolidatedReportData {
  projectInfo: {
    name: string;
    description: string;
    totalAnalyses: number;
    dateRange: string;
    exportDate: string;
  };
  executiveSummary: string;
  keyFindings: string[];
  surfaceAnalyses: Array<{
    surfaceName: string;
    surfaceType: string;
    summary: string;
    criticalIssues: string[];
    recommendations: string[];
  }>;
  crossSurfaceInsights: {
    commonProblems: string[];
    trends: string[];
    recommendations: string[];
  };
  technicalDetails: {
    methodologies: string[];
    metrics: string;
    limitations: string;
  };
}

export class ConsolidatedReportGenerator {
  
  static generateReport(projectId: string): ConsolidatedReportData {
    console.log(`📝 Generiere Consolidated Report für Projekt ${projectId}...`);
    
    const project = ProjectManager.getProject(projectId);
    const analyses = ProjectManager.getAnalysesByProject(projectId);
    
    if (!project || analyses.length === 0) {
      throw new Error(`Projekt ${projectId} nicht gefunden oder leer`);
    }
    
    // Aggregierte Daten laden
    const aggregatedData = CrossSurfaceAnalyzer.analyzeProject(projectId);
    
    // Report-Komponenten generieren
    const executiveSummary = this.generateExecutiveSummary(aggregatedData);
    const keyFindings = this.extractKeyFindings(aggregatedData);
    const surfaceAnalyses = this.generateSurfaceAnalyses(analyses);
    const crossSurfaceInsights = this.generateCrossSurfaceInsights(aggregatedData);
    const technicalDetails = this.generateTechnicalDetails(aggregatedData);
    
    return {
      projectInfo: {
        name: project.projectName,
        description: project.projectDescription || 'Keine Beschreibung verfügbar',
        totalAnalyses: analyses.length,
        dateRange: `${aggregatedData.projectInfo.dateRange.earliest} - ${aggregatedData.projectInfo.dateRange.latest}`,
        exportDate: new Date().toLocaleDateString('de-DE')
      },
      executiveSummary,
      keyFindings,
      surfaceAnalyses,
      crossSurfaceInsights,
      technicalDetails
    };
  }
  
  private static generateExecutiveSummary(data: AggregatedExportData): string {
    const totalBefunde = data.crossSurfaceAnalysis.totalBefunde;
    const totalAnalyses = data.projectInfo.totalAnalyses;
    const avgBefundePerAnalysis = Math.round((totalBefunde / totalAnalyses) * 100) / 100;
    
    // Kritische Probleme zählen
    const criticalIssues = Object.entries(data.crossSurfaceAnalysis.severityDistribution)
      .filter(([severity]) => ['catastrophic', 'critical', 'serious'].includes(severity))
      .reduce((sum, [, count]) => sum + count, 0);
    
    const criticalPercentage = Math.round((criticalIssues / totalBefunde) * 100);
    
    // Trend-Bewertung
    const trendDirection = data.crossSurfaceAnalysis.trends.improvingAreas.length > 
                          data.crossSurfaceAnalysis.trends.worseningAreas.length 
                          ? 'positiv' : 'neutral';
    
    return `Diese umfassende Usability-Analyse des Projekts "${data.projectInfo.projectName}" umfasst ${totalAnalyses} Oberflächenanalysen mit insgesamt ${totalBefunde} identifizierten Befunden (durchschnittlich ${avgBefundePerAnalysis} Befunde pro Oberfläche). 

Von den identifizierten Problemen sind ${criticalIssues} (${criticalPercentage}%) als kritisch oder schwerwiegend eingestuft, was ${criticalPercentage < 20 ? 'eine akzeptable' : criticalPercentage < 40 ? 'eine erhöhte' : 'eine hohe'} Priorität für Verbesserungen signalisiert.

Die Analyse zeigt eine ${trendDirection}e Entwicklung der Usability über den Analysezeitraum hinweg. Die häufigsten Problemkategorien betreffen ${data.crossSurfaceAnalysis.commonProblems.slice(0, 3).map(p => p.problem.toLowerCase()).join(', ')}.

Die Oberflächen mit der höchsten Anzahl an Befunden sind ${data.crossSurfaceAnalysis.surfaceComparison
  .sort((a, b) => b.befundeCount - a.befundeCount)
  .slice(0, 3)
  .map(s => s.surfaceName)
  .join(', ')}, was auf gezielte Optimierungsbedarfe hinweist.`;
  }
  
  private static extractKeyFindings(data: AggregatedExportData): string[] {
    const findings: string[] = [];
    
    // Top-Probleme
    if (data.crossSurfaceAnalysis.commonProblems.length > 0) {
      const topProblem = data.crossSurfaceAnalysis.commonProblems[0];
      findings.push(`🔴 ${topProblem.problem}: Tritt in ${topProblem.occurrences} Fällen auf ${topProblem.surfaces.length} verschiedenen Oberflächen auf`);
    }
    
    // Schweregrad-Verteilung
    const severityEntries = Object.entries(data.crossSurfaceAnalysis.severityDistribution)
      .sort(([,a], [,b]) => b - a);
    
    if (severityEntries.length > 0) {
      const [mostCommonSeverity, count] = severityEntries[0];
      const percentage = Math.round((count / data.crossSurfaceAnalysis.totalBefunde) * 100);
      findings.push(`📊 ${percentage}% aller Befunde sind als "${mostCommonSeverity}" kategorisiert (${count} von ${data.crossSurfaceAnalysis.totalBefunde})`);
    }
    
    // Oberflächen-Performance
    const bestSurface = data.crossSurfaceAnalysis.surfaceComparison
      .filter(s => s.befundeCount > 0)
      .sort((a, b) => a.criticalIssues - b.criticalIssues)[0];
    
    const worstSurface = data.crossSurfaceAnalysis.surfaceComparison
      .sort((a, b) => b.criticalIssues - a.criticalIssues)[0];
    
    if (bestSurface && worstSurface && bestSurface !== worstSurface) {
      findings.push(`✅ Beste Performance: "${bestSurface.surfaceName}" (${bestSurface.criticalIssues} kritische Probleme)`);
      findings.push(`⚠️ Optimierungsbedarf: "${worstSurface.surfaceName}" (${worstSurface.criticalIssues} kritische Probleme)`);
    }
    
    // Trends
    if (data.crossSurfaceAnalysis.trends.improvingAreas.length > 0) {
      findings.push(`📈 Positive Entwicklung: ${data.crossSurfaceAnalysis.trends.improvingAreas.join(', ')}`);
    }
    
    if (data.crossSurfaceAnalysis.trends.worseningAreas.length > 0) {
      findings.push(`📉 Verschlechterung: ${data.crossSurfaceAnalysis.trends.worseningAreas.join(', ')}`);
    }
    
    // Effizienz-Metriken
    findings.push(`⚡ Analyse-Effizienz: ${data.projectStats.analysisEfficiency} Befunde pro Minute`);
    
    return findings;
  }
  
  private static generateSurfaceAnalyses(analyses: StoredAnalysis[]) {
    return analyses.map(analysis => {
      const befunde = analysis.analysisData.befunde;
      const criticalIssues = befunde.filter(b => 
        ['catastrophic', 'critical', 'serious'].includes(b.schweregrad)
      );
      
      // Kategorien gruppieren
      const kategorien = befunde.reduce((acc, b) => {
        acc[b.kategorie] = (acc[b.kategorie] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topKategorien = Object.entries(kategorien)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([kategorie, count]) => `${kategorie} (${count})`)
        .join(', ');
      
      // Summary generieren
      const summary = `Die Analyse von "${analysis.surfaceName}" (${analysis.surfaceType}) ergab ${befunde.length} Befunde, davon ${criticalIssues.length} kritische. Hauptproblemkategorien: ${topKategorien || 'Keine spezifischen Kategorien'}. Durchgeführt mit ${analysis.analysisData.promptVariante} in ${analysis.analysisData.verarbeitungszeit}ms.`;
      
      // Kritische Probleme extrahieren
      const criticalIssuesList = criticalIssues.slice(0, 5).map(issue => 
        `${issue.schweregrad.toUpperCase()}: ${issue.titel}`
      );
      
      // Basis-Empfehlungen
      const recommendations = [];
      if (criticalIssues.length > 0) {
        recommendations.push(`Sofortige Behebung der ${criticalIssues.length} kritischen Probleme`);
      }
      if (befunde.length > 10) {
        recommendations.push('Priorisierung der Befunde nach Business Impact');
      }
      if (analysis.surfaceType === 'Mobile') {
        recommendations.push('Mobile-spezifische Usability-Tests durchführen');
      }
      
      return {
        surfaceName: analysis.surfaceName,
        surfaceType: analysis.surfaceType,
        summary,
        criticalIssues: criticalIssuesList,
        recommendations
      };
    });
  }
  
  private static generateCrossSurfaceInsights(data: AggregatedExportData) {
    const commonProblems = data.crossSurfaceAnalysis.commonProblems
      .slice(0, 5)
      .map(problem => 
        `${problem.problem}: Betrifft ${problem.surfaces.length} Oberflächen mit ${problem.occurrences} Vorkommen`
      );
    
    const trends = [
      ...data.crossSurfaceAnalysis.trends.improvingAreas.map(area => `✅ Verbesserung: ${area}`),
      ...data.crossSurfaceAnalysis.trends.worseningAreas.map(area => `❌ Verschlechterung: ${area}`)
    ];
    
    const recommendations = [
      'Etablierung einheitlicher Design-Guidelines für konsistente User Experience',
      'Implementierung von Cross-Surface-Testing zur Identifikation globaler Probleme',
      'Priorisierung der häufigsten Problemkategorien für maximalen Impact'
    ];
    
    // Dynamische Empfehlungen basierend auf Daten
    if (data.crossSurfaceAnalysis.commonProblems.length > 3) {
      recommendations.push('Design System Review zur Reduzierung wiederkehrender Probleme');
    }
    
    if (data.projectStats.surfaceTypes['Mobile'] > 0) {
      recommendations.push('Mobile-First Approach für bessere geräteübergreifende Konsistenz');
    }
    
    return {
      commonProblems,
      trends,
      recommendations
    };
  }
  
  private static generateTechnicalDetails(data: AggregatedExportData) {
    const methodologies = [
      ...data.projectStats.promptVariantsUsed.map(variant => `Prompt-Variante: ${variant}`),
      ...data.projectStats.llmModelsUsed.map(model => `LLM-Modell: ${model}`)
    ];
    
    const metrics = `Gesamt-Verarbeitungszeit: ${data.projectStats.totalProcessingTime}ms
Analyse-Effizienz: ${data.projectStats.analysisEfficiency} Befunde/Min
Oberflächen-Verteilung: ${Object.entries(data.projectStats.surfaceTypes).map(([type, count]) => `${type}: ${count}`).join(', ')}
Kategorie-Verteilung: ${Object.entries(data.projectStats.surfaceCategories).map(([cat, count]) => `${cat}: ${count}`).join(', ')}`;
    
    const limitations = `Analysebasis: ${data.projectInfo.totalAnalyses} Oberflächenanalysen
Zeitraum: ${data.projectInfo.dateRange.earliest} bis ${data.projectInfo.dateRange.latest}
Automated Analysis: Ergebnisse basieren auf LLM-gestützter Analyse
Hinweis: Cross-Surface-Vergleiche sind algorithmisch und sollten durch manuelle Review ergänzt werden`;
    
    return {
      methodologies,
      metrics,
      limitations
    };
  }
}

// 📄 Text Report Formatter
export function formatConsolidatedReport(data: ConsolidatedReportData): string {
  const report = `
# CONSOLIDATED USABILITY REPORT
## ${data.projectInfo.name}

**Erstellt am:** ${data.projectInfo.exportDate}
**Analysezeitraum:** ${data.projectInfo.dateRange}
**Umfang:** ${data.projectInfo.totalAnalyses} Oberflächenanalysen

---

## EXECUTIVE SUMMARY

${data.executiveSummary}

---

## KEY FINDINGS

${data.keyFindings.map(finding => `• ${finding}`).join('\n')}

---

## OBERFLÄCHEN-ANALYSEN

${data.surfaceAnalyses.map(surface => `
### ${surface.surfaceName} (${surface.surfaceType})

${surface.summary}

**Kritische Probleme:**
${surface.criticalIssues.length > 0 ? surface.criticalIssues.map(issue => `• ${issue}`).join('\n') : '• Keine kritischen Probleme identifiziert'}

**Empfehlungen:**
${surface.recommendations.map(rec => `• ${rec}`).join('\n')}
`).join('\n')}

---

## CROSS-SURFACE INSIGHTS

### Häufige Probleme über alle Oberflächen

${data.crossSurfaceInsights.commonProblems.map(problem => `• ${problem}`).join('\n')}

### Trends

${data.crossSurfaceInsights.trends.length > 0 ? data.crossSurfaceInsights.trends.map(trend => `• ${trend}`).join('\n') : '• Keine signifikanten Trends identifiziert'}

### Strategische Empfehlungen

${data.crossSurfaceInsights.recommendations.map(rec => `• ${rec}`).join('\n')}

---

## TECHNISCHE DETAILS

### Angewandte Methodologien

${data.technicalDetails.methodologies.map(method => `• ${method}`).join('\n')}

### Metriken

\`\`\`
${data.technicalDetails.metrics}
\`\`\`

### Einschränkungen und Hinweise

${data.technicalDetails.limitations}

---

**Bericht generiert durch UXScope Multi-Surface Analysis Aggregator (MSAA)**
**Für detaillierte Einzelanalysen siehe separaten Excel-Export**
`;

  return report.trim();
}

// 🚀 Export Functions
export function exportConsolidatedReport(projectId: string): void {
  try {
    console.log(`📝 Generiere Consolidated Report für Projekt ${projectId}...`);
    
    const reportData = ConsolidatedReportGenerator.generateReport(projectId);
    const reportText = formatConsolidatedReport(reportData);
    
    // Dateiname generieren
    const safeProjectName = reportData.projectInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Consolidated_Report_${safeProjectName}_${new Date().toISOString().split('T')[0]}.md`;
    
    // Download als Markdown-Datei
    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8' });
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
    
    alert(`📄 Consolidated Report erfolgreich erstellt!\n\n` +
          `Projekt: ${reportData.projectInfo.name}\n` +
          `Datei: ${filename}\n\n` +
          `Inhalt:\n` +
          `• Executive Summary\n` +
          `• ${reportData.keyFindings.length} Key Findings\n` +
          `• ${reportData.surfaceAnalyses.length} Oberflächen-Analysen\n` +
          `• Cross-Surface Insights\n` +
          `• Technische Details\n\n` +
          `Der Bericht wurde als Markdown-Datei heruntergeladen.`);
    
    console.log(`✅ Consolidated Report Export abgeschlossen: ${filename}`);
    
  } catch (error) {
    console.error('❌ Consolidated Report Export Fehler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    alert(`❌ Consolidated Report Export fehlgeschlagen!\n\nFehler: ${errorMessage}`);
  }
}

export function exportConsolidatedReportAsHTML(projectId: string): void {
  try {
    console.log(`🌐 Generiere HTML Consolidated Report für Projekt ${projectId}...`);
    
    const reportData = ConsolidatedReportGenerator.generateReport(projectId);
    
    // HTML-Template
    const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consolidated Report - ${reportData.projectInfo.name}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; border-left: 4px solid #3498db; padding-left: 15px; }
        h3 { color: #2c3e50; margin-top: 25px; }
        .meta { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .executive-summary { background: #e8f6f3; padding: 20px; border-radius: 8px; border-left: 5px solid #27ae60; }
        .key-findings ul { background: #fef9e7; padding: 20px; border-radius: 8px; border-left: 5px solid #f39c12; }
        .surface-analysis { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #6c757d; }
        .critical-issues { background: #fdebec; padding: 15px; border-radius: 5px; border-left: 4px solid #e74c3c; }
        .recommendations { background: #e8f5e8; padding: 15px; border-radius: 5px; border-left: 4px solid #27ae60; }
        .cross-surface { background: #eaf4fd; padding: 20px; border-radius: 8px; border-left: 5px solid #3498db; }
        .tech-details { background: #f4f4f4; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 0.9em; }
        ul li { margin: 8px 0; }
        .highlight { background: #fff3cd; padding: 2px 6px; border-radius: 3px; }
        .footer { margin-top: 40px; text-align: center; color: #7f8c8d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 CONSOLIDATED USABILITY REPORT</h1>
        <h2>${reportData.projectInfo.name}</h2>
        
        <div class="meta">
            <strong>Erstellt am:</strong> ${reportData.projectInfo.exportDate}<br>
            <strong>Analysezeitraum:</strong> ${reportData.projectInfo.dateRange}<br>
            <strong>Umfang:</strong> ${reportData.projectInfo.totalAnalyses} Oberflächenanalysen
        </div>

        <h2>📋 EXECUTIVE SUMMARY</h2>
        <div class="executive-summary">
            ${reportData.executiveSummary.replace(/\n/g, '<br><br>')}
        </div>

        <h2>🔍 KEY FINDINGS</h2>
        <div class="key-findings">
            <ul>
                ${reportData.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
            </ul>
        </div>

        <h2>🖥️ OBERFLÄCHEN-ANALYSEN</h2>
        ${reportData.surfaceAnalyses.map(surface => `
            <div class="surface-analysis">
                <h3>${surface.surfaceName} (${surface.surfaceType})</h3>
                <p>${surface.summary}</p>
                
                <div class="critical-issues">
                    <h4>🚨 Kritische Probleme:</h4>
                    ${surface.criticalIssues.length > 0 ? 
                        `<ul>${surface.criticalIssues.map(issue => `<li>${issue}</li>`).join('')}</ul>` : 
                        '<p>Keine kritischen Probleme identifiziert</p>'
                    }
                </div>
                
                <div class="recommendations">
                    <h4>💡 Empfehlungen:</h4>
                    <ul>
                        ${surface.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('')}

        <h2>🔗 CROSS-SURFACE INSIGHTS</h2>
        <div class="cross-surface">
            <h3>Häufige Probleme über alle Oberflächen</h3>
            <ul>
                ${reportData.crossSurfaceInsights.commonProblems.map(problem => `<li>${problem}</li>`).join('')}
            </ul>
            
            <h3>Trends</h3>
            ${reportData.crossSurfaceInsights.trends.length > 0 ? 
                `<ul>${reportData.crossSurfaceInsights.trends.map(trend => `<li>${trend}</li>`).join('')}</ul>` :
                '<p>Keine signifikanten Trends identifiziert</p>'
            }
            
            <h3>Strategische Empfehlungen</h3>
            <ul>
                ${reportData.crossSurfaceInsights.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>

        <h2>⚙️ TECHNISCHE DETAILS</h2>
        <div class="tech-details">
            <h3>Angewandte Methodologien</h3>
            <ul>
                ${reportData.technicalDetails.methodologies.map(method => `<li>${method}</li>`).join('')}
            </ul>
            
            <h3>Metriken</h3>
            <pre>${reportData.technicalDetails.metrics}</pre>
            
            <h3>Einschränkungen und Hinweise</h3>
            <p>${reportData.technicalDetails.limitations}</p>
        </div>
        
        <div class="footer">
            <p><strong>Bericht generiert durch UXScope Multi-Surface Analysis Aggregator (MSAA)</strong></p>
            <p>Für detaillierte Einzelanalysen siehe separaten Excel-Export</p>
        </div>
    </div>
</body>
</html>`;
    
    // Dateiname generieren
    const safeProjectName = reportData.projectInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Consolidated_Report_${safeProjectName}_${new Date().toISOString().split('T')[0]}.html`;
    
    // Download als HTML-Datei
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
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
    
    alert(`🌐 HTML Consolidated Report erfolgreich erstellt!\n\n` +
          `Projekt: ${reportData.projectInfo.name}\n` +
          `Datei: ${filename}\n\n` +
          `Der Bericht wurde als interaktive HTML-Datei heruntergeladen.\n` +
          `Öffne die Datei in einem Browser für die beste Darstellung.`);
    
    console.log(`✅ HTML Consolidated Report Export abgeschlossen: ${filename}`);
    
  } catch (error) {
    console.error('❌ HTML Consolidated Report Export Fehler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    alert(`❌ HTML Consolidated Report Export fehlgeschlagen!\n\nFehler: ${errorMessage}`);
  }
}
