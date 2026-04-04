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
        <div className="pb-3 text-xs text-muted-foreground leading-relaxed space-y-1.5">
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

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="max-w-md mx-auto w-full px-5 py-6 space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(167,139,250,0.1))', boxShadow: '0 0 0 1px rgba(129,140,248,0.2) inset' }}>
            <Key size={18} style={{ color: '#818cf8' }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {isUk ? 'Потрібен API ключ Anthropic' : 'Anthropic API Key Required'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isUk
                ? 'Персональний ключ доступу до Claude AI — ми його не бачимо'
                : 'Personal access key to Claude AI — we never see it'}
            </p>
          </div>
        </div>

        {/* What is it */}
        <div className="rounded-xl p-3.5 space-y-2" style={{ background: 'rgba(129,140,248,0.07)', border: '1px solid rgba(129,140,248,0.15)' }}>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isUk
              ? 'API ключ — це пароль, який дозволяє Forge звертатись до Claude AI від твого імені. Ти реєструєшся на сайті Anthropic, поповнюєш баланс і отримуєш ключ. Всі запити йдуть напряму з твого браузера — ми його не зберігаємо на сервері.'
              : 'An API key is a password that lets Forge talk to Claude AI on your behalf. You sign up on Anthropic\'s website, add credits, and get a key. All requests go directly from your browser — we don\'t store it on our servers.'}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={11} style={{ color: '#34d399' }} />
              <span className="text-xs" style={{ color: '#34d399' }}>
                {isUk ? 'Зберігається тільки у тебе' : 'Stored only on your device'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={11} style={{ color: '#34d399' }} />
              <span className="text-xs" style={{ color: '#34d399' }}>
                {isUk ? '~$1–5 на місяць' : '~$1–5 per month'}
              </span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="rounded-xl p-3.5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-semibold text-foreground/80">
            {isUk ? '📋 Як отримати ключ' : '📋 How to get a key'}
          </p>
          <div className="space-y-2.5">
            {(isUk ? [
              { t: 'Відкрий сайт Anthropic', d: 'Натисни кнопку нижче → Sign up (або Log in якщо вже є акаунт)' },
              { t: 'Поповни баланс — мінімум $5', d: 'Billing → Add credit. Без цього ключ не працює' },
              { t: 'Створи API ключ', d: 'API Keys → Create Key → дай будь-яку назву, наприклад "Forge"' },
              { t: 'Скопіюй ключ одразу', d: 'Він показується лише один раз — після закриття вікна не відновити' },
            ] : [
              { t: 'Open Anthropic website', d: 'Click the button below → Sign up (or Log in if you already have an account)' },
              { t: 'Add credits — minimum $5', d: 'Billing → Add credit. Without this the key won\'t work' },
              { t: 'Create an API key', d: 'API Keys → Create Key → give it any name, e.g. "Forge"' },
              { t: 'Copy the key immediately', d: 'It\'s shown only once — can\'t be recovered after closing the dialog' },
            ]).map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5" style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}>{i + 1}</span>
                <div>
                  <p className="text-xs font-medium text-foreground">{s.t}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg px-3 py-2 flex items-start gap-2" style={WARN_STYLE}>
            <AlertCircle size={12} className="shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
            <p className="text-xs leading-relaxed" style={{ color: '#fbbf24' }}>
              {isUk
                ? 'Найчастіша помилка — ключ є, але баланс не поповнено. Без $5 на рахунку нічого не працюватиме.'
                : 'Most common mistake — key exists but no credits added. Without $5 balance nothing will work.'}
            </p>
          </div>
        </div>

        {/* Input + console link */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {isUk ? 'Встав свій API ключ:' : 'Paste your API key:'}
            </p>
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80"
              style={{ color: '#818cf8' }}
            >
              <ExternalLink size={11} />
              console.anthropic.com
            </a>
          </div>
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
        <div className="rounded-xl px-4 py-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <FAQ question={isUk ? 'Ключ є, але бот пише помилку — що робити?' : 'Key exists but bot returns an error — what to do?'}>
            <p>1. {isUk ? 'Чи поповнений баланс? Billing → перевір чи є кошти' : 'Is balance topped up? Billing → check if you have credits'}</p>
            <p>2. {isUk ? 'Чи скопіював ключ повністю? Він довгий (~100 символів)' : 'Did you copy the full key? It\'s long (~100 characters)'}</p>
            <p>3. {isUk ? 'Спробуй створити новий ключ — старий міг бути видалений' : 'Try creating a new key — the old one might have been deleted'}</p>
          </FAQ>
          <FAQ question={isUk ? 'Де знайти ключ якщо вже створював?' : 'Where to find a key I already created?'}>
            <p>
              {isUk
                ? 'Anthropic не показує ключі повністю після створення. Якщо не зберіг — створи новий, це займає 30 секунд і безкоштовно.'
                : 'Anthropic doesn\'t show full keys after creation. If you didn\'t save it — create a new one, it takes 30 seconds and is free.'}
            </p>
          </FAQ>
          <FAQ question={isUk ? 'Скільки коштує використання?' : 'How much does it cost?'}>
            <p>
              {isUk
                ? 'Одне повідомлення — приблизно $0.001–0.005 (менше копійки). При активному використанні (10–20 повідомлень на день) виходить $1–5 на місяць. Перші $5 вистачить на 1–3 місяці.'
                : 'One message costs about $0.001–0.005. With active use (10–20 messages per day) it\'s $1–5/month. Your first $5 will last 1–3 months.'}
            </p>
          </FAQ>
        </div>

      </div>
    </div>
  )
}
