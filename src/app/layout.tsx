import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'UXScope - LLM-basierte Usability-Analyse',
  description: 'Automatisierte Erkennung und Bewertung von Usability-Problemen in digitalen Anwendungen mittels Large Language Models',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('darkMode') === 'true') {
                  document.documentElement.classList.add('dark')
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
