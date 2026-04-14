'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && pathname !== '/auth') {
      router.push('/auth')
    }
    if (!loading && user && pathname === '/auth') {
      router.push('/')
    }
  }, [user, loading, pathname, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <p className="label-sm mb-2">Protocol No. 01</p>
          <h1 className="text-cream text-2xl font-bold tracking-widest uppercase animate-pulse-gold">PROTOCOL</h1>
        </div>
      </div>
    )
  }

  if (!user && pathname !== '/auth') return null

  return <>{children}</>
}
