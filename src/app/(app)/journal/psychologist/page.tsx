'use client'

import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { uk as ukLocale } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2, Brain, User } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ApiKeySetup } from '@/components/ApiKeySetup'
import type { DayJob } from '@/lib/types'
import { useT } from '@/lib/i18n'

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} className="opacity-80">{part.slice(1, -1)}</em>
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px]">{part.slice(1, -1)}</code>
    return <span key={i}>{part}</span>
  })
}

function renderMessage(content: string): React.ReactNode {
  return content.split('\n').map((line, i) => {
    if (line.trim() === '---') return <hr key={i} className="my-2 border-white/10" />
    const h2 = line.match(/^##\s+(.*)/)
    if (h2) return <p key={i} className="font-bold text-white/90 mt-2 mb-0.5">{parseInline(h2[1])}</p>
    const listMatch = line.match(/^[-•]\s+(.*)/)
    if (listMatch)
      return (
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
          <span>{parseInline(listMatch[1])}</span>
        </div>
      )
    if (line === '') return <div key={i} className="h-1.5" />
    return <p key={i}>{parseInline(line)}</p>
  })
}

type Message = { role: 'user' | 'assistant'; content: string }

export default function PsychologistPage() {
  const { t, lang } = useT()
  const dateLocale = lang === 'uk' ? ukLocale : enUS
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { userName, apiKey, setApiKey, journalEntries, journalProfiles, tasks, streak, trackXP, workDays, dayJobs, categories } = useStore()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const buildContext = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const dayOfWeek = format(new Date(), 'EEEE', { locale: dateLocale })
    const recentJournal = [...journalEntries]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14)
    const todayTasks = tasks.filter(tk => tk.date === today)
    const upcomingTasks = tasks.filter(tk => tk.date >= today && !tk.completed).sort((a, b) => a.date.localeCompare(b.date))
    return {
      userName, today, dayOfWeek, todayTasks, upcomingTasks,
      streak, trackXP, workDaysCount: workDays.length,
      dayJobs: (dayJobs as DayJob[]).slice(0, 14),
      recentJournal,
      journalProfiles,
      poolCards: [],
    }
  }

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, context: buildContext(), apiKey, mode: 'psychologist', lang }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessages(m => [...m, { role: 'assistant', content: `⚠️ ${data.error || 'Error'}` }])
        return
      }
      if (data.message) setMessages(m => [...m, { role: 'assistant', content: data.message }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: t.psychologist.networkError }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const btnStyle = { background: 'rgba(167,139,250,0.1)', boxShadow: '0 0 0 1px rgba(129,140,248,0.2) inset', color: '#a78bfa' }

  if (!apiKey) {
    return <ApiKeySetup onSave={setApiKey} />
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center justify-center rounded-xl p-2 transition-all" style={btnStyle}>
            <ArrowLeft size={16} />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
            <Brain size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-foreground">{t.psychologist.title}</h1>
            <p className="text-xs text-muted-foreground">{t.psychologist.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 mt-1">
              <Brain size={14} className="text-primary" />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm leading-relaxed">
              {renderMessage(t.psychologist.welcome)}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 mt-1">
                <Brain size={14} className="text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-tr-sm whitespace-pre-wrap'
                : 'bg-card text-foreground border border-border rounded-tl-sm'
            }`}>
              {msg.role === 'assistant' ? renderMessage(msg.content) : msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary mt-1">
                <User size={14} className="text-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 mt-1">
              <Brain size={14} className="text-primary" />
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.psychologist.placeholder}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
