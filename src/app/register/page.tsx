'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Loader2, Mail, Lock, User } from 'lucide-react'
import { useT } from '@/lib/i18n'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useT()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) { setError(t.register.passwordTooShort); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name.trim() } },
      })
      if (error) throw error
      if (data.session) {
        router.push('/')
        router.refresh()
      } else {
        setDone(true)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t.register.passwordTooShort)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#060510' }}>
        <div className="text-center space-y-4">
          <div className="text-5xl">📬</div>
          <h2 className="text-xl font-bold text-white">{t.register.checkEmail}</h2>
          <p className="text-sm text-white/40 max-w-xs">
            {t.register.confirmationSent(email)}
          </p>
          <Link href="/login" className="inline-block text-sm text-primary hover:opacity-80 transition-opacity">
            {t.register.backToLogin}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#060510' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/forge-logo.svg" alt="Forge" className="h-14 w-14" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Forge</h1>
            <p className="text-sm text-white/40 mt-0.5">{t.tagline}</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 space-y-4" style={{ background: '#0d0b18', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-base font-semibold text-white">{t.register.title}</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t.register.name}
                required
                className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.register.email}
                required
                className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t.register.password}
                required
                className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 rounded-xl px-3 py-2" style={{ background: 'rgba(239,68,68,0.08)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)' }}
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {loading ? t.register.registering : t.register.signUp}
            </button>

            <p className="text-xs text-white/25 text-center">
              {t.register.privacyConsent}{' '}
              <Link href="/privacy" className="text-white/40 hover:text-white/60 underline underline-offset-2 transition-colors">
                {t.register.privacyPolicy}
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-white/30 mt-4">
          {t.register.alreadyHaveAccount}{' '}
          <Link href="/login" className="text-primary hover:opacity-80 transition-opacity">
            {t.register.signIn}
          </Link>
        </p>
      </div>
    </div>
  )
}
