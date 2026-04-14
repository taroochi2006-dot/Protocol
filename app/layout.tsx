import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'
import { AuthProvider } from '@/lib/auth-context'
import AuthGuard from './components/AuthGuard'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'PROTOCOL — Personal OS',
  description: 'Your personal dashboard for habits, stocks, and tasks.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-bg text-cream antialiased">
        <AuthProvider>
          <AuthGuard>
            <div className="flex h-full min-h-screen">
              {/* Desktop sidebar */}
              <aside className="hidden md:flex flex-col w-56 border-r border-gold-border bg-surface shrink-0 fixed h-full z-30">
                <div className="px-6 py-6 border-b border-gold-border">
                  <p className="label-sm mb-1">Protocol No. 01</p>
                  <h1 className="text-cream text-xl font-bold tracking-widest uppercase">PROTOCOL</h1>
                  <p className="text-muted text-xs mt-0.5 tracking-wider">Personal OS</p>
                </div>
                <Navigation mode="sidebar" />
                <div className="mt-auto px-6 py-4 border-t border-gold-border">
                  <p className="text-muted text-xs tracking-widest">ISO · COLD-CHAIN · 24H</p>
                </div>
              </aside>

              {/* Main content */}
              <main className="flex-1 md:ml-56 flex flex-col min-h-screen">
                <div className="flex-1 pb-20 md:pb-0">
                  {children}
                </div>
              </main>
            </div>

            {/* Mobile bottom nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gold-border z-50">
              <Navigation mode="bottom" />
            </nav>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
