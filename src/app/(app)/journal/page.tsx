'use client'

import { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { uk as ukLocale } from 'date-fns/locale'
import Link from 'next/link'
import { Trash2, Brain, CheckCircle2, Loader2, MessageSquare, Download, ArrowLeft, ArrowRight, MoreHorizontal } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useT } from '@/lib/i18n'

export default function JournalPage() {
  const { t, lang } = useT()
  const dateLocale = lang === 'uk' ? ukLocale : enUS
  const { journalEntries, saveJournalEntry, deleteJournalEntry, journalProfiles, setJournalProfile, userName, apiKey } = useStore()
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeMsg, setAnalyzeMsg] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const today = format(new Date(), 'yyyy-MM-dd')
  const currentMonth = today.slice(0, 7)
  const [selectedDate, setSelectedDate] = useState(today)
  if (!mounted) return null

  const entry = journalEntries.find(e => e.date === selectedDate)
  const text = entry?.text ?? ''

  const days = Array.from({ length: 30 }, (_, i) => {
    const d = addDays(new Date(), -i)
    return format(d, 'yyyy-MM-dd')
  })

  function handleChange(val: string) {
    if (val.trim()) saveJournalEntry(selectedDate, val)
    else if (entry) deleteJournalEntry(entry.id)
  }

  function handleDelete() {
    if (entry) deleteJournalEntry(entry.id)
  }

  function handleExport() {
    const sorted = [...journalEntries].sort((a, b) => a.date.localeCompare(b.date))
    if (sorted.length === 0) return
    const lines = sorted.map(e => {
      const label = format(new Date(e.date + 'T12:00:00'), 'd MMMM yyyy (EEEE)', { locale: dateLocale })
      return `=== ${label} ===\n\n${e.text}\n`
    })
    const content = lines.join('\n\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `journal-${format(new Date(), 'yyyy-MM-dd')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleAnalyze() {
    const monthEntries = journalEntries.filter(e => e.date.startsWith(currentMonth))
    if (monthEntries.length === 0) {
      setAnalyzeMsg(t.journal.noEntries)
      setTimeout(() => setAnalyzeMsg(null), 3000)
      return
    }
    setAnalyzing(true)
    setAnalyzeMsg(null)
    try {
      const res = await fetch('/api/journal-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: currentMonth, entries: monthEntries, existingProfiles: journalProfiles, userName, apiKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setJournalProfile(currentMonth, data.profile)
      setAnalyzeMsg('✓')
    } catch (e) {
      setAnalyzeMsg(e instanceof Error ? e.message : 'Error')
    } finally {
      setAnalyzing(false)
      setTimeout(() => setAnalyzeMsg(null), 4000)
    }
  }

  const currentProfile = journalProfiles[currentMonth]
  const monthLabel = format(new Date(currentMonth + '-01'), 'LLLL yyyy', { locale: dateLocale })
  const btnStyle = { background: 'rgba(167,139,250,0.1)', boxShadow: '0 0 0 1px rgba(129,140,248,0.2) inset', color: '#a78bfa' }


  return (
    <div className="p-4 sm:p-6 h-full flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{t.journal.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t.journal.subtitle}</p>
        </div>

        {/* Mobile: ··· menu */}
        <div className="sm:hidden relative shrink-0">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all"
            style={btnStyle}
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute right-0 top-11 z-20 w-52 rounded-2xl overflow-hidden flex flex-col"
                style={{ background: '#1a1a2e', boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08) inset' }}
              >
                <button
                  onClick={() => { handleAnalyze(); setMenuOpen(false) }}
                  disabled={analyzing}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-all hover:bg-white/5 disabled:opacity-40"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  {analyzing ? <Loader2 size={15} className="animate-spin shrink-0" /> : <Brain size={15} className="shrink-0" style={{ color: '#818cf8' }} />}
                  {analyzing ? t.journal.analyzing : t.journal.refreshBase}
                </button>
                <Link
                  href="/journal/profiles"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all hover:bg-white/5"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  <Brain size={15} className="shrink-0" style={{ color: '#818cf8' }} />
                  {t.journal.notes}{Object.keys(journalProfiles).length > 0 ? ` (${Object.keys(journalProfiles).length})` : ''}
                </Link>
                <Link
                  href="/journal/psychologist"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all hover:bg-white/5"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  <MessageSquare size={15} className="shrink-0" style={{ color: '#818cf8' }} />
                  {t.journal.psychologist}
                </Link>
                <button
                  onClick={() => { handleExport(); setMenuOpen(false) }}
                  disabled={journalEntries.length === 0}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-all hover:bg-white/5 disabled:opacity-30"
                  style={{ color: 'rgba(255,255,255,0.8)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <Download size={15} className="shrink-0" style={{ color: '#818cf8' }} />
                  {t.journal.downloadJournal}
                </button>
              </div>
            </>
          )}
          {analyzeMsg && (
            <p className="absolute right-0 top-11 text-xs whitespace-nowrap" style={{ color: analyzeMsg === '✓' ? '#34d399' : '#f87171' }}>
              {analyzeMsg}
            </p>
          )}
        </div>

        {/* Desktop: row of buttons */}
        <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
              style={analyzing ? { background: 'rgba(255,255,255,0.05)', boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset', color: 'rgba(255,255,255,0.3)' } : btnStyle}
            >
              {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
              {analyzing ? t.journal.analyzing : t.journal.refreshBase}
            </button>
            <Link href="/journal/profiles" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all" style={btnStyle}>
              <Brain size={14} />
              {t.journal.notes}{Object.keys(journalProfiles).length > 0 ? ` (${Object.keys(journalProfiles).length})` : ''}
            </Link>
            <Link href="/journal/psychologist" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all" style={btnStyle}>
              <MessageSquare size={14} />
              {t.journal.psychologist}
            </Link>
            <button
              onClick={handleExport}
              disabled={journalEntries.length === 0}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all disabled:opacity-30"
              style={btnStyle}
            >
              <Download size={14} />
              {t.journal.download}
            </button>
          </div>
          {analyzeMsg && (
            <p className="flex items-center gap-1.5 text-xs" style={{ color: analyzeMsg === '✓' ? '#34d399' : '#f87171' }}>
              {analyzeMsg === '✓' && <CheckCircle2 size={11} />}
              {analyzeMsg}
            </p>
          )}
          {currentProfile && !analyzeMsg && (
            <p className="text-xs text-white/25">
              {t.journal.baseUpdated(monthLabel, format(new Date(currentProfile.updatedAt), 'd MMM, HH:mm', { locale: dateLocale }))}
            </p>
          )}
        </div>
      </div>

      {/* Info banner — shown if no entries yet this month */}
      {journalEntries.filter(e => e.date.startsWith(currentMonth)).length === 0 && (
        <div className="rounded-2xl p-5 flex gap-4" style={{ background: 'rgba(129,140,248,0.07)', border: '1px solid rgba(129,140,248,0.15)' }}>
          <div className="text-2xl shrink-0">🧠</div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">{t.journal.howItWorks}</p>

            <div className="space-y-1">
              <p className="text-xs font-medium" style={{ color: 'rgba(167,139,250,0.8)' }}>{t.journal.howItWorksText}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium" style={{ color: 'rgba(167,139,250,0.8)' }}>{t.journal.profileGoesToAssistant}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.journal.profileGoesToAssistantText}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium" style={{ color: 'rgba(167,139,250,0.8)' }}>{t.journal.whyCheap}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.journal.whyCheapText}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <p className="text-xs" style={{ color: 'rgba(129,140,248,0.6)' }}>{t.journal.localOnly}</p>
              <p className="text-xs" style={{ color: 'rgba(129,140,248,0.6)' }}>{t.journal.trained}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: 3-day strip with arrows */}
      {(() => {
        const selObj = new Date(selectedDate + 'T12:00:00')
        const mobileDays = [-1, 0, 1].map(o => format(addDays(selObj, o), 'yyyy-MM-dd'))
        function navDay(dir: -1 | 1) {
          const next = format(addDays(selObj, dir), 'yyyy-MM-dd')
          if (dir === -1 && next < today) return
          setSelectedDate(next)
        }
        return (
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => navDay(-1)}
              disabled={selectedDate === today}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-20"
              style={{ background: '#0f0f1a', boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset', color: 'rgba(255,255,255,0.4)' }}
            >
              <ArrowLeft size={14} />
            </button>
            <div className="grid grid-cols-3 gap-1.5 flex-1">
              {mobileDays.map(date => {
                const hasEntry = journalEntries.some(e => e.date === date)
                const isToday = date === today
                const isSelected = date === selectedDate
                const isPast = date < today
                return (
                  <button
                    key={date}
                    onClick={() => !isPast && setSelectedDate(date)}
                    disabled={isPast}
                    className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-3 w-full transition-all disabled:cursor-not-allowed"
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(167,139,250,0.1))' : 'rgba(255,255,255,0.04)',
                      boxShadow: isSelected ? '0 0 0 1px rgba(129,140,248,0.25) inset' : '0 0 0 1px rgba(255,255,255,0.06) inset',
                      opacity: isPast ? 0.3 : 1,
                    }}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wider leading-none"
                      style={{ color: isSelected ? '#818cf8' : isToday ? 'rgba(129,140,248,0.4)' : 'rgba(255,255,255,0.25)' }}
                    >
                      {isToday ? t.common.today.slice(0, 3) : format(new Date(date + 'T12:00:00'), 'EEE', { locale: dateLocale })}
                    </p>
                    <p className="text-lg font-black leading-tight"
                      style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }}
                    >
                      {format(new Date(date + 'T12:00:00'), 'd', { locale: dateLocale })}
                    </p>
                    {hasEntry && (
                      <div className="h-1 w-1 rounded-full mt-0.5" style={{ background: isSelected ? '#818cf8' : 'rgba(255,255,255,0.2)' }} />
                    )}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => navDay(1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all"
              style={{ background: '#0f0f1a', boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset', color: 'rgba(255,255,255,0.4)' }}
            >
              <ArrowRight size={14} />
            </button>
          </div>
        )
      })()}

      <div className="flex gap-4 flex-1 min-h-0">

        {/* Desktop: vertical date list */}
        <div
          className="hidden sm:flex w-36 shrink-0 rounded-2xl overflow-y-auto flex-col gap-1 p-2"
          style={{ background: '#0f0f1a', boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset', maxHeight: '70vh' }}
        >
          {days.map(date => {
            const hasEntry = journalEntries.some(e => e.date === date)
            const isToday = date === today
            const isSelected = date === selectedDate
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className="w-full rounded-xl px-3 py-2.5 text-left transition-all"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(167,139,250,0.1))'
                    : 'transparent',
                  boxShadow: isSelected ? '0 0 0 1px rgba(129,140,248,0.2) inset' : undefined,
                }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: isSelected ? '#818cf8' : 'rgba(255,255,255,0.3)' }}
                >
                  {isToday ? t.common.today : format(new Date(date + 'T12:00:00'), 'EEE', { locale: dateLocale })}
                </p>
                <p className="text-sm font-semibold mt-0.5"
                  style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }}
                >
                  {format(new Date(date + 'T12:00:00'), 'd MMM', { locale: dateLocale })}
                </p>
                {hasEntry && (
                  <div className="mt-1 h-1 w-4 rounded-full" style={{ background: '#818cf880' }} />
                )}
              </button>
            )
          })}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div
            className="rounded-2xl p-1 flex-1 flex flex-col min-h-0"
            style={{ background: '#0f0f1a', boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset' }}
          >
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-white/60">
                {format(new Date(selectedDate + 'T12:00:00'), 'd MMMM yyyy', { locale: dateLocale })}
              </p>
              {entry && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-all hover:opacity-100 opacity-50"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
                >
                  <Trash2 size={11} />
                  {t.common.delete}
                </button>
              )}
            </div>
            <textarea
              className="flex-1 w-full resize-none bg-transparent px-4 pb-4 text-sm leading-relaxed outline-none"
              style={{ color: 'rgba(255,255,255,0.8)', minHeight: '120px' }}
              placeholder={t.journal.placeholder}
              value={text}
              onChange={e => handleChange(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <p className="text-xs text-white/25">
              {entry
                ? t.journal.autoSaved(format(new Date(entry.updatedAt), 'd MMM, HH:mm', { locale: dateLocale }))
                : t.journal.startWriting}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
