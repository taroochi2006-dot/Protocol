'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) { setError(error); setLoading(false); return }
      router.push('/')
    } else {
      const { error } = await signUp(email, password)
      if (error) { setError(error); setLoading(false); return }
      setMessage('Account created! Check your email to confirm, then sign in.')
      setMode('signin')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-bg">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="label-sm mb-2">Protocol No. 01</p>
          <h1 className="text-cream text-3xl font-bold tracking-widest uppercase">PROTOCOL</h1>
          <p className="text-muted text-xs mt-1 tracking-wider">Personal OS</p>
        </div>

        {/* Card */}
        <div className="card p-6 corner-mark">
          <p className="label-sm mb-4">{mode === 'signin' ? 'Sign In' : 'Create Account'}</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-muted text-xs block mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                className="input-base"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-muted text-xs block mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                className="input-base"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-negative text-xs bg-negative/10 border border-negative/20 rounded px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-positive text-xs bg-positive/10 border border-positive/20 rounded px-3 py-2">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center mt-1"
            >
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gold-border text-center">
            <p className="text-muted text-xs">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setMessage('') }}
                className="text-gold hover:underline"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-muted text-xs text-center mt-6 tracking-wider">
          Your data is private and encrypted.
        </p>
      </div>
    </div>
  )
}
