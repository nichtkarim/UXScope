import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Usability Tester - LLM-powered UX Analysis',
  description: 'Modern web application for usability testing with LLM integration following ISO human-centered design standards',
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
