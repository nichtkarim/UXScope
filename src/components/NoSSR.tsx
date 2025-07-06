'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

interface NoSSRProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

function NoSSRComponent({ children, fallback }: NoSSRProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Export mit dynamic import um SSR zu deaktivieren
const NoSSR = dynamic(() => Promise.resolve(NoSSRComponent), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              LLM-basierte Usability-Evaluation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Wissenschaftliche Methodik zur Usability-Bewertung digitaler Anwendungen
            </p>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-500">
              Bachelorarbeit: Vergleich von GPT-4o, Claude 4 und Llama 3
            </div>
          </header>
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-600 dark:text-gray-400">Lädt...</div>
          </div>
        </div>
      </div>
    </main>
  )
})

export default NoSSR
