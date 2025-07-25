// Vereinfachte und robuste Download-Funktion
export function forceDownload(content: string, filename: string, mimeType: string = 'text/plain') {
  try {
    // Erstelle Blob
    const blob = new Blob([content], { type: mimeType + ';charset=utf-8' })
    
    // Erstelle temporäre URL
    const url = URL.createObjectURL(blob)
    
    // Erstelle temporären Link
    const tempLink = document.createElement('a')
    tempLink.href = url
    tempLink.download = filename
    tempLink.style.display = 'none'
    
    // Füge Link zum DOM hinzu und klicke
    document.body.appendChild(tempLink)
    tempLink.click()
    
    // Aufräumen
    document.body.removeChild(tempLink)
    URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Download failed:', error)
    return false
  }
}

export function downloadText(content: string, filename: string): boolean {
  return forceDownload(content, filename, 'text/plain')
}

export function downloadJson(data: any, filename: string): boolean {
  const jsonString = JSON.stringify(data, null, 2)
  return forceDownload(jsonString, filename, 'application/json')
}

// Fallback für manuelle Downloads
export function showDownloadFallback(content: string, filename: string) {
  const newWindow = window.open('', '_blank')
  if (newWindow) {
    newWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: monospace; padding: 20px; white-space: pre-wrap; }
            .header { background: #f5f5f5; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>Download: ${filename}</h3>
            <p>Bitte kopieren Sie den Inhalt und speichern Sie ihn manuell:</p>
          </div>
          ${content}
        </body>
      </html>
    `)
    newWindow.document.close()
  } else {
    alert('Popup wurde blockiert. Bitte erlauben Sie Popups für diese Seite.')
  }
}
