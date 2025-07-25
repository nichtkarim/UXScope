import * as XLSX from 'xlsx';

export interface ExcelExportData {
  // Meta-Informationen
  titel: string;
  datum: string;
  zeit: string;
  exportId: string;
  promptVariante: string;
  promptSprache: string;
  llmModell: string;
  
  // Kontext-Informationen
  appOverview: string;
  eingegebenerCode: string;
  benutzerAufgabe: string;
  
  // Befunde
  befunde: Array<{
    befundId: string;
    kategorie: string;
    schweregrad: string;
    titel: string;
    beschreibung: string;
    position: number;
  }>;
  
  // Vollständige Analyse
  vollstaendigeAnalyse: string;
  
  // Technische Details
  verarbeitungszeit: number;
  bildVorhanden: boolean;
  kontextVorhanden: boolean;
  visionUnterstuetzt: boolean;
}

export function prepareExcelData(
  analysis: string,
  metadata: any,
  promptUsed: string,
  contextData: any,
  promptVariant: string,
  promptLanguage: string,
  summary: any,
  parsedSections: any[]
): ExcelExportData {
  
  const now = new Date();
  const exportId = `UXS_${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
  
  // Befunde strukturieren - unterschiedliche Behandlung für Study-Pure
  const befunde = parsedSections
    .filter(section => section.type !== 'summary')
    .map((section, index) => ({
      befundId: `${exportId}_B${(index + 1).toString().padStart(3, '0')}`,
      kategorie: promptVariant === 'study-pure' ? 'Befund' : section.type,
      schweregrad: promptVariant === 'study-pure' ? 'Nicht bewertet' : section.severity,
      titel: promptVariant === 'study-pure' ? `Befund ${index + 1}` : section.title,
      beschreibung: section.content[0] || '',
      position: section.textPosition || -1
    }));

  return {
    titel: `Usability-Analyse ${promptVariant.toUpperCase()}`,
    datum: now.toLocaleDateString('de-DE'),
    zeit: now.toLocaleTimeString('de-DE'),
    exportId: exportId,
    promptVariante: promptVariant === 'study-pure' ? 'Study-Pure (A)' : 
                   promptVariant === 'basic' ? 'Basic (B)' : 'Advanced (C)',
    promptSprache: promptLanguage === 'de' ? 'Deutsch' : 'English',
    llmModell: `${metadata?.llmName || 'Unbekannt'} (${metadata?.llmModel || 'Unbekannt'})`,
    
    appOverview: contextData?.description || 'Keine Beschreibung verfügbar',
    eingegebenerCode: contextData?.code || 'Kein Code eingegeben',
    benutzerAufgabe: contextData?.userTask || 'Keine Aufgabe definiert',
    
    befunde: befunde,
    vollstaendigeAnalyse: analysis,
    
    verarbeitungszeit: metadata?.processingTimeMs || 0,
    bildVorhanden: metadata?.imageProvided || false,
    kontextVorhanden: metadata?.contextProvided || false,
    visionUnterstuetzt: metadata?.supportsVision || false
  };
}

export function createExcelWorkbook(data: ExcelExportData): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  
  // === ÜBERSICHT ARBEITSBLATT ===
  const uebersichtData = [
    ['USABILITY-ANALYSE EXPORT'],
    [''],
    ['GRUNDINFORMATIONEN'],
    ['Titel', data.titel],
    ['Export ID', data.exportId],
    ['Datum', data.datum],
    ['Zeit', data.zeit],
    ['Prompt-Variante', data.promptVariante],
    ['Prompt-Sprache', data.promptSprache],
    ['LLM-Modell', data.llmModell],
    [''],
    ['ZUSAMMENFASSUNG'],
    ['Gesamte Befunde', data.befunde.length]
  ];

  // Nur für nicht-Study-Pure Varianten: Kategorien-Statistiken hinzufügen
  const isStudyPure = data.promptVariante.includes('Study-Pure');
  if (!isStudyPure) {
    uebersichtData.push(
      ['Katastrophale Probleme', data.befunde.filter(b => b.schweregrad === 'catastrophic').length],
      ['Kritische Probleme', data.befunde.filter(b => b.schweregrad === 'critical').length],
      ['Ernste Probleme', data.befunde.filter(b => b.schweregrad === 'serious').length],
      ['Geringe Probleme', data.befunde.filter(b => b.schweregrad === 'minor').length],
      ['Positive Befunde', data.befunde.filter(b => b.schweregrad === 'positive').length]
    );
  } else {
    uebersichtData.push(
      ['Hinweis', 'Study-Pure Variante: Befunde werden nicht nach Schweregrad kategorisiert']
    );
  }

  uebersichtData.push(
    [''],
    ['TECHNISCHE DETAILS'],
    ['Verarbeitungszeit (ms)', data.verarbeitungszeit],
    ['Bild vorhanden', data.bildVorhanden ? 'Ja' : 'Nein'],
    ['Kontext vorhanden', data.kontextVorhanden ? 'Ja' : 'Nein'],
    ['Vision unterstützt', data.visionUnterstuetzt ? 'Ja' : 'Nein']
  );
  
  const uebersichtWS = XLSX.utils.aoa_to_sheet(uebersichtData);
  
  // Styling für Übersicht
  uebersichtWS['!cols'] = [
    { wch: 25 }, // Spalte A - Labels
    { wch: 50 }  // Spalte B - Werte
  ];
  
  XLSX.utils.book_append_sheet(workbook, uebersichtWS, 'Übersicht');
  
  // === BEFUNDE ARBEITSBLATT ===
  const befundeHeaders = [
    'Befund ID',
    'Position',
    'Kategorie', 
    'Schweregrad',
    'Titel',
    'Beschreibung'
  ];
  
  const befundeData = [
    befundeHeaders,
    ...data.befunde.map(befund => [
      befund.befundId,
      befund.position >= 0 ? befund.position : 'N/A',
      befund.kategorie,
      befund.schweregrad,
      befund.titel,
      befund.beschreibung
    ])
  ];
  
  const befundeWS = XLSX.utils.aoa_to_sheet(befundeData);
  
  // Spaltenbreiten für Befunde
  befundeWS['!cols'] = [
    { wch: 20 }, // Befund ID
    { wch: 10 }, // Position
    { wch: 15 }, // Kategorie
    { wch: 15 }, // Schweregrad
    { wch: 30 }, // Titel
    { wch: 80 }  // Beschreibung
  ];
  
  XLSX.utils.book_append_sheet(workbook, befundeWS, 'Befunde');
  
  // === KONTEXT ARBEITSBLATT ===
  const kontextData = [
    ['PROJEKT-KONTEXT'],
    [''],
    ['App Overview'],
    [data.appOverview],
    [''],
    ['Eingegebener Code'],
    [data.eingegebenerCode],
    [''],
    ['Benutzer-Aufgabe'],
    [data.benutzerAufgabe]
  ];
  
  const kontextWS = XLSX.utils.aoa_to_sheet(kontextData);
  kontextWS['!cols'] = [{ wch: 100 }]; // Eine breite Spalte
  
  XLSX.utils.book_append_sheet(workbook, kontextWS, 'Kontext');
  
  // === VOLLSTÄNDIGE ANALYSE ARBEITSBLATT ===
  const analyseData = [
    ['VOLLSTÄNDIGE ANALYSE'],
    [''],
    [data.vollstaendigeAnalyse]
  ];
  
  const analyseWS = XLSX.utils.aoa_to_sheet(analyseData);
  analyseWS['!cols'] = [{ wch: 120 }]; // Sehr breite Spalte für den gesamten Text
  
  XLSX.utils.book_append_sheet(workbook, analyseWS, 'Vollständige Analyse');
  
  // === KATEGORIEN ANALYSE ARBEITSBLATT ===
  const kategorienStats = data.befunde.reduce((acc, befund) => {
    if (!acc[befund.schweregrad]) {
      acc[befund.schweregrad] = [];
    }
    acc[befund.schweregrad].push(befund);
    return acc;
  }, {} as Record<string, typeof data.befunde>);
  
  let kategorienData: any[][];
  
  // Unterschiedliche Darstellung für Study-Pure vs. andere Varianten
  if (isStudyPure) {
    kategorienData = [
      ['BEFUNDE-ÜBERSICHT (STUDY-PURE)'],
      [''],
      ['Hinweis', 'In der Study-Pure Variante werden Befunde nicht nach Schweregrad kategorisiert.'],
      ['', 'Alle Befunde werden als neutrale Usability-Befunde behandelt.'],
      [''],
      ['Befund Nr.', 'Befund ID', 'Beschreibung (Auszug)']
    ];
    
    data.befunde.forEach((befund, index) => {
      const beschreibungAuszug = befund.beschreibung.length > 50 
        ? befund.beschreibung.substring(0, 50) + '...' 
        : befund.beschreibung;
      kategorienData.push([
        (index + 1).toString(),
        befund.befundId,
        beschreibungAuszug
      ]);
    });
  } else {
    kategorienData = [
      ['KATEGORIEN-ANALYSE'],
      [''],
      ['Schweregrad', 'Anzahl', 'Prozent', 'Befund IDs']
    ];
    
    const totalBefunde = data.befunde.length;
    Object.entries(kategorienStats).forEach(([kategorie, befunde]) => {
      const prozent = totalBefunde > 0 ? ((befunde.length / totalBefunde) * 100).toFixed(1) : '0';
      const befundIds = befunde.map(b => b.befundId).join(', ');
      kategorienData.push([kategorie, befunde.length.toString(), `${prozent}%`, befundIds]);
    });
  }
  
  const kategorienWS = XLSX.utils.aoa_to_sheet(kategorienData);
  
  if (isStudyPure) {
    kategorienWS['!cols'] = [
      { wch: 12 }, // Befund Nr.
      { wch: 25 }, // Befund ID
      { wch: 80 }  // Beschreibung
    ];
  } else {
    kategorienWS['!cols'] = [
      { wch: 20 }, // Schweregrad
      { wch: 10 }, // Anzahl
      { wch: 10 }, // Prozent
      { wch: 60 }  // Befund IDs
    ];
  }
  
  const sheetName = isStudyPure ? 'Befunde-Übersicht' : 'Kategorien-Analyse';
  XLSX.utils.book_append_sheet(workbook, kategorienWS, sheetName);
  
  return workbook;
}

export function downloadExcelFile(workbook: XLSX.WorkBook, filename: string): void {
  try {
    // Excel-Datei als Blob erstellen
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      compression: true 
    });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Download-Link erstellen
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Download starten
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log(`Excel-Datei "${filename}" erfolgreich heruntergeladen`);
  } catch (error) {
    console.error('Fehler beim Excel-Download:', error);
    throw new Error(`Excel-Download fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  }
}

export function exportToExcel(
  analysis: string,
  metadata: any,
  promptUsed: string,
  contextData: any,
  promptVariant: string,
  promptLanguage: string,
  summary: any,
  parsedSections: any[]
): void {
  try {
    console.log('Starte Excel-Export...');
    
    // Daten vorbereiten
    const excelData = prepareExcelData(
      analysis,
      metadata,
      promptUsed,
      contextData,
      promptVariant,
      promptLanguage,
      summary,
      parsedSections
    );
    
    // Excel-Arbeitsmappe erstellen
    const workbook = createExcelWorkbook(excelData);
    
    // Dateiname generieren
    const filename = `Usability_Analyse_${excelData.exportId}.xlsx`;
    
    // Download starten
    downloadExcelFile(workbook, filename);
    
    // Erfolgs-Feedback
    alert(`📊 Excel-Export erfolgreich!\n\nDatei: ${filename}\n\nInhalt:\n• ${excelData.befunde.length} Befunde\n• ${Object.keys(excelData).length} Datenfelder\n• 5 Arbeitsblätter\n\nDie Datei wurde heruntergeladen.`);
    
  } catch (error) {
    console.error('Excel-Export Fehler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    alert(`❌ Excel-Export fehlgeschlagen!\n\nFehler: ${errorMessage}`);
  }
}
