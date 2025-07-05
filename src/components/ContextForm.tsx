'use client'

import { FileText, Code } from 'lucide-react'

interface ContextData {
  description: string
  uiCode: string
}

interface ContextFormProps {
  contextData: ContextData
  onContextChange: (data: ContextData) => void
}

export default function ContextForm({ contextData, onContextChange }: ContextFormProps) {
  const handleDescriptionChange = (value: string) => {
    onContextChange({
      ...contextData,
      description: value
    })
  }

  const handleCodeChange = (value: string) => {
    onContextChange({
      ...contextData,
      uiCode: value
    })
  }

  return (
    <div className="space-y-6">
      {/* Context Description */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">
            Kontext-Beschreibung *
          </label>
        </div>
        <textarea
          value={contextData.description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Beschreiben Sie den Kontext der Anwendung, die Zielgruppe, den Verwendungszweck und spezielle Anforderungen..."
          className="w-full h-32 p-3 border border-border rounded-lg bg-background text-foreground 
                     focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Beispiel: "E-Commerce Checkout-Prozess für mobile Geräte, Zielgruppe: 25-45 Jahre, 
          hohe Kaufbereitschaft, schneller Abschluss erwünscht"
        </p>
      </div>

      {/* UI Code */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Code className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">
            UI-Code (optional)
          </label>
        </div>
        <textarea
          value={contextData.uiCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="HTML, CSS, JSX oder andere UI-Code-Fragmente der analysierten Oberfläche..."
          className="w-full h-40 p-3 border border-border rounded-lg bg-background text-foreground 
                     focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Der Code hilft dem LLM, die technische Implementierung zu verstehen und 
          spezifischere Empfehlungen zu geben.
        </p>
      </div>

      {/* Guidelines Info */}
      <div className="bg-accent/50 border border-accent rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">Bewertungskriterien</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground mb-1">Nielsen's Heuristiken:</p>
            <ul className="space-y-1 text-xs">
              <li>• Systemstatus-Sichtbarkeit</li>
              <li>• System-Welt-Übereinstimmung</li>
              <li>• Benutzerkontrolle</li>
              <li>• Konsistenz & Standards</li>
              <li>• Fehlervermeidung</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">ISO-Standards:</p>
            <ul className="space-y-1 text-xs">
              <li>• Effektivität</li>
              <li>• Effizienz</li>
              <li>• Zufriedenheit</li>
              <li>• Barrierefreiheit (WCAG)</li>
              <li>• Erlernbarkeit</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
