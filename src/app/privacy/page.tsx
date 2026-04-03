'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useT } from '@/lib/i18n'

export default function PrivacyPage() {
  const { t } = useT()
  const s = t.privacy.sections

  return (
    <div className="min-h-screen p-6 sm:p-10" style={{ background: '#060510' }}>
      <div className="max-w-2xl mx-auto">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          {t.privacy.back}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <img src="/forge-logo.svg" alt="Forge" className="h-10 w-10" />
          <h1 className="text-2xl font-bold text-white">{t.privacy.title}</h1>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed"
          style={{ background: '#0d0b18', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-white/40 text-xs">{t.privacy.lastUpdated}</p>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">{s.whatWeCollect.title}</h2>
            <p className="text-white/50">{s.whatWeCollect.intro}</p>
            <ul className="list-disc list-inside space-y-1 text-white/50 ml-2">
              {s.whatWeCollect.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">{s.whereStored.title}</h2>
            <p className="text-white/50">
              {s.whereStored.p1.split('Supabase').map((part, i, arr) =>
                i < arr.length - 1
                  ? <span key={i}>{part}<span className="text-white/70">Supabase</span></span>
                  : <span key={i}>{part}</span>
              )}
            </p>
            <p className="text-white/50">{s.whereStored.p2}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">{s.aiAnalysis.title}</h2>
            <p className="text-white/50">
              {s.aiAnalysis.p1.split('Anthropic (Claude AI)').map((part, i, arr) =>
                i < arr.length - 1
                  ? <span key={i}>{part}<span className="text-white/70">Anthropic (Claude AI)</span></span>
                  : <span key={i}>{part}</span>
              )}
            </p>
            <p className="text-white/50">{s.aiAnalysis.p2}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">{s.whatWeDontDo.title}</h2>
            <ul className="list-disc list-inside space-y-1 text-white/50 ml-2">
              {s.whatWeDontDo.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">{s.yourRights.title}</h2>
            <ul className="list-disc list-inside space-y-1 text-white/50 ml-2">
              {s.yourRights.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">{s.contact.title}</h2>
            <p className="text-white/50">
              {s.contact.text} <span className="text-white/70">support@forgeyou.dev</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
