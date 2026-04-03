'use client'

import { useState } from 'react'
import { Key, ExternalLink, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useT } from '@/lib/i18n'

const WARN_STYLE = { background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }

function FAQ({ question, children }: { question: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 py-2.5 text-left text-xs font-medium text-foreground/70 hover:text-foreground transition-colors"
      >
        {question}
        {open ? <ChevronUp size={13} className="shrink-0 text-muted-foreground" /> : <ChevronDown size={13} className="shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="pb-3 text-xs text-muted-foreground leading-relaxed space-y-1">
          {children}
        </div>
      )}
    </div>
  )
}

export function ApiKeySetup({ onSave }: { onSave: (key: string) => void }) {
  const { lang } = useT()
  const isUk = lang === 'uk'
  const [value, setValue] = useState('')
  const [show, setShow] = useState(false)

  const isValid = value.trim().startsWith('sk-')

  const steps = isUk ? [
    { title: 'Зареєструйся на Anthropic', desc: 'Sign up або Log in' },
    { title: 'Billing → Add credit → $5', desc: 'Без балансу ключ не працює' },
    { title: 'API Keys → Create Key', desc: 'Дай будь-яку назву, наприклад "Forge"' },
    { title: 'Скопіюй ключ одразу', desc: 'Він показується лише один раз' },
  ] : [
    { title: 'Sign up on Anthropic', desc: 'Sign up or Log in' },
    { title: 'Billing → Add credit → $5', desc: 'Key won\'t work without balance' },
    { title: 'API Keys → Create Key', desc: 'Give it any name, e.g. "Forge"' },
    { title: 'Copy the key immediately', desc: 'It\'s shown only once' },
  ]

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="max-w-md mx-auto w-full px-5 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(167,139,250,0.1))', boxShadow: '0 0 0 1px rgba(129,140,248,0.2) inset' }}>
            <Key size={20} style={{ color: '#818cf8' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {isUk ? 'Потрібен API ключ' : 'API Key Required'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {isUk
                ? 'Forge використовує Claude AI напряму через твій ключ — ми його не бачимо. Коштує ~$1–5/міс'
                : 'Forge uses Claude AI directly via your key — we never see it. Costs ~$1–5/month'}
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground/80">
              {isUk ? 'Як отримати ключ' : 'How to get a key'}
            </p>
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80"
              style={{ color: '#818cf8' }}
            >
              <ExternalLink size={11} />
              {isUk ? 'Відкрити консоль' : 'Open console'}
            </a>
          </div>
          <div className="space-y-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5" style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}>{i + 1}</span>
                <div>
                  <p className="text-xs font-medium text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg px-3 py-2 flex items-start gap-2 mt-1" style={WARN_STYLE}>
            <AlertCircle size={12} className="shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
            <p className="text-xs leading-relaxed" style={{ color: '#fbbf24' }}>
              {isUk
                ? 'Без поповнення балансу ($5) ключ не буде працювати — це найчастіша причина помилки'
                : 'Without adding credits ($5) the key won\'t work — this is the most common error cause'}
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {isUk ? 'Встав свій API ключ:' : 'Paste your API key:'}
          </p>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && isValid) onSave(value.trim()) }}
              placeholder="sk-ant-api03-..."
              className="w-full rounded-xl px-4 py-3 pr-24 text-sm text-foreground outline-none font-mono"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${isValid ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.1)'}` }}
            />
            <button
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
            >
              {show ? (isUk ? 'сховати' : 'hide') : (isUk ? 'показати' : 'show')}
            </button>
          </div>
          {value && !isValid && (
            <p className="text-xs" style={{ color: '#f87171' }}>
              {isUk ? 'Ключ повинен починатись з sk-...' : 'Key must start with sk-...'}
            </p>
          )}
          {isValid && (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} style={{ color: '#34d399' }} />
              <p className="text-xs" style={{ color: '#34d399' }}>
                {isUk ? 'Ключ виглядає правильно' : 'Key looks correct'}
              </p>
            </div>
          )}
          <button
            onClick={() => { if (isValid) onSave(value.trim()) }}
            disabled={!isValid}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)' }}
          >
            {isUk ? 'Зберегти та продовжити' : 'Save and continue'}
          </button>
        </div>

        {/* FAQ */}
        <div className="rounded-2xl px-4 py-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <FAQ question={isUk ? 'Ключ є, але бот пише помилку' : 'Key exists but bot returns an error'}>
            <p>1. {isUk ? 'Перевір Billing — чи є кошти на рахунку?' : 'Check Billing — do you have credits?'}</p>
            <p>2. {isUk ? 'Переконайся що скопіював ключ повністю (він довгий ~100 символів)' : 'Make sure you copied the full key (~100 characters long)'}</p>
            <p>3. {isUk ? 'Спробуй створити новий ключ' : 'Try creating a new key'}</p>
          </FAQ>
          <FAQ question={isUk ? 'Де знайти ключ якщо вже створював?' : 'Where to find a key I already created?'}>
            <p>
              {isUk
                ? 'Anthropic не показує ключі повністю після створення. Якщо не зберіг — створи новий, це займе 30 секунд.'
                : 'Anthropic doesn\'t show full keys after creation. If you didn\'t save it — create a new one, it takes 30 seconds.'}
            </p>
          </FAQ>
          <FAQ question={isUk ? 'Це безпечно?' : 'Is this safe?'}>
            <p>
              {isUk
                ? 'Ключ зберігається тільки в браузері і ніколи не потрапляє на наші сервери. Запити до Claude йдуть напряму від тебе.'
                : 'The key is stored only in your browser and never reaches our servers. Requests to Claude go directly from you.'}
            </p>
          </FAQ>
        </div>

      </div>
    </div>
  )
}
