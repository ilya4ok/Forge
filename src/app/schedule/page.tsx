'use client'

import { format, startOfWeek, addDays, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Monitor, MessageSquare, Check, Sun, AlarmClock, Home } from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { TRACK_COLORS, TRACK_LABELS } from '@/lib/types'

const TRACK_EMOJI: Record<string, string> = {
  ai: '🤖', design: '🎨', selfdevelopment: '🧠',
  mediabuy: '📈', english: '🇬🇧', polish: '🇵🇱', gym: '💪',
}

// How long each track's session takes (minutes).
// Polish has two variants: long (60 min, free days) and short (30 min, Mac work days).
const TASK_DURATION: Record<string, number> = {
  gym: 60, ai: 90, design: 90,
  english: 45, polish: 30, 'polish-long': 60,
  selfdevelopment: 45, mediabuy: 60,
}

// Display order within a block (gym last — it's an evening activity at 18:00)
const TRACK_ORDER: Record<string, number> = {
  english: 1, polish: 2, selfdevelopment: 3,
  ai: 4, design: 5, mediabuy: 6, gym: 7,
}

const COMMUTE_TO_WORK_MIN = 40  // 40 min commute to work
const COMMUTE_HOME_MIN = 60     // 1 hour commute home
const PREP_MIN = 90             // 1.5 hours: cook + dress + eat
const DEPART_BUF = 15           // minutes buffer to get out the door
const GAP = 15                  // minutes gap between tasks
const BED_TIME = '01:00'        // Target bedtime every day (01:00)
const RITUAL_TIME = '00:00'     // Sleep ritual starts at midnight
const WAKE_TIME = '09:00'       // BED_TIME + 8h sleep

// Times before DAY_ANCHOR belong to "next day" — needed for midnight crossover comparisons
const DAY_ANCHOR = 6 * 60  // 06:00

function normMin(m: number): number {
  return m < DAY_ANCHOR ? m + 24 * 60 : m
}

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minToTime(total: number): string {
  // Handle midnight crossover (e.g. 00:30)
  const v = ((total % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(v / 60)
  const m = v % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

function byOrder<T extends { track: string }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => (TRACK_ORDER[a.track] ?? 9) - (TRACK_ORDER[b.track] ?? 9))
}

// Compute task start times.
// wakeUp   = fixed WAKE_TIME (09:00 every day = BED_TIME 01:00 + 8h)
// prepEnd  = wakeUp + 1.5h prep
// departure= job.start − 40 min commute − 15 min buffer
// Tasks that don't fit before departure get time = null
// Gym: Mon(1)/Wed(3)/Fri(5) fixed at 18:00; other days flows in schedule
function computeTimes(
  tasks: Array<{ id: string; track: string; recurringType?: string }>,
  job: { start: string; end: string } | undefined,
  dateStr: string
): {
  taskTimes: Record<string, string | null>
  wakeUp: string
  prepEnd: string
  departureTime: string | null
  fitsBeforeWork: boolean
} {
  const taskTimes: Record<string, string | null> = {}
  const sorted = byOrder(tasks)

  const wakeMin = timeToMin(WAKE_TIME)  // 09:00 = 540
  const prepEndMin = wakeMin + PREP_MIN // 10:30 = 630

  // Must leave home this many minutes before job starts
  const departureMin = job ? timeToMin(job.start) - COMMUTE_TO_WORK_MIN - DEPART_BUF : null

  // Day of week for gym fixed-time logic (0=Sun, 1=Mon…6=Sat)
  const dow = new Date(dateStr + 'T12:00:00').getDay()
  const gymFixed = dow === 1 || dow === 3 || dow === 5  // Mon/Wed/Fri → 18:00

  let cursor = prepEndMin
  for (const task of sorted) {
    if (task.track === 'gym') {
      if (gymFixed) {
        // Mon/Wed/Fri: fixed evening time, doesn't occupy morning slot
        taskTimes[task.id] = '18:00'
        continue
      }
      // Other days: gym flows in schedule (flexible time)
    }
    const durKey = task.recurringType === 'long' ? `${task.track}-long` : task.track
    const dur = TASK_DURATION[durKey] ?? TASK_DURATION[task.track] ?? 45
    if (departureMin === null || cursor + dur <= departureMin) {
      taskTimes[task.id] = minToTime(cursor)
    } else {
      taskTimes[task.id] = null // no window before departure
    }
    cursor += dur + GAP
  }

  // fitsBeforeWork checks non-gym tasks + flexible gym days
  const fitsBeforeWork = sorted
    .filter(t => t.track !== 'gym' || !gymFixed)
    .every(t => taskTimes[t.id] !== null)

  return {
    taskTimes,
    wakeUp: WAKE_TIME,
    prepEnd: minToTime(prepEndMin),
    departureTime: departureMin !== null ? minToTime(departureMin) : null,
    fitsBeforeWork,
  }
}

// Sleep times: ritual 00:00, bed 01:00 every day.
// If home arrival is after ritual start — show actual times from arrival.
// Uses normMin for midnight-aware comparison (23:30 < 00:00 in "same night" sense).
function getSleepTimes(job?: { end: string }): { sleepRitual: string; bedtime: string; lateArrival: boolean; arrivalTime: string | null } {
  const ritualMin = timeToMin(RITUAL_TIME)  // 0 (00:00)

  if (!job) {
    return { sleepRitual: RITUAL_TIME, bedtime: BED_TIME, lateArrival: false, arrivalTime: null }
  }

  const homeMin = timeToMin(job.end) + COMMUTE_HOME_MIN
  // normMin: times before 06:00 are treated as "after midnight" (add 24h) for comparison
  const lateArrival = normMin(homeMin) > normMin(ritualMin)

  if (lateArrival) {
    // Ritual starts on arrival, bed 60 min later
    return {
      sleepRitual: minToTime(homeMin),
      bedtime: minToTime(homeMin + 60),
      lateArrival: true,
      arrivalTime: minToTime(homeMin),
    }
  }

  return {
    sleepRitual: RITUAL_TIME,
    bedtime: BED_TIME,
    lateArrival: false,
    arrivalTime: minToTime(homeMin),
  }
}

export default function SchedulePage() {
  const { tasks, dayJobs, completeTask, uncompleteTask } = useStore()

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Хроники</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(weekStart, 'd MMM', { locale: ru })} — {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: ru })}
          </p>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:text-foreground"
          style={{ background: '#12121e', boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset' }}
        >
          <MessageSquare size={13} />
          Изменить через чат
        </Link>
      </div>

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayTasks = tasks.filter(t => t.date === dateStr)
          const doneCount = dayTasks.filter(t => t.completed).length
          const isTodayDay = isToday(day)
          const hasJob = dayJobs.some(j => j.date === dateStr)

          return (
            <div
              key={dateStr}
              className="flex flex-col items-center gap-1.5 rounded-xl p-2.5"
              style={{
                background: isTodayDay ? 'linear-gradient(160deg, #16163a, #0f0f25)' : '#0f0f1a',
                boxShadow: isTodayDay
                  ? '0 0 0 1px rgba(129,140,248,0.3) inset'
                  : '0 0 0 1px rgba(255,255,255,0.05) inset',
              }}
            >
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isTodayDay ? 'text-primary' : 'text-white/30'}`}>
                {format(day, 'EEE', { locale: ru })}
              </p>
              <p className={`text-base font-black leading-none ${isTodayDay ? 'text-white' : 'text-white/50'}`}>
                {format(day, 'd')}
              </p>
              {hasJob && <div className="h-1 w-1 rounded-full bg-white/20" title="Работа в маке" />}
              {dayTasks.length > 0 && (
                <>
                  <div className="flex flex-wrap justify-center gap-0.5 max-w-full">
                    {dayTasks.slice(0, 6).map(t => (
                      <div
                        key={t.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: t.completed
                            ? TRACK_COLORS[t.track as keyof typeof TRACK_COLORS]
                            : 'rgba(255,255,255,0.12)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[9px] text-white/20 font-medium">{doneCount}/{dayTasks.length}</p>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Day sections */}
      <div className="space-y-4">
        {weekDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayTasks = tasks.filter(t => t.date === dateStr)
          const job = dayJobs.find(j => j.date === dateStr)
          const isTodayDay = isToday(day)
          const doneCount = dayTasks.filter(t => t.completed).length

          if (dayTasks.length === 0 && !job) return null

          // All tasks go to morning — on Mac days there's no time in the evening
          const sortedTasks = byOrder(dayTasks)
          const { taskTimes, wakeUp, prepEnd, departureTime, fitsBeforeWork } = computeTimes(sortedTasks, job, dateStr)
          const { sleepRitual, bedtime, lateArrival, arrivalTime } = getSleepTimes(job)

          return (
            <div
              key={dateStr}
              className="rounded-2xl overflow-hidden"
              style={{
                background: isTodayDay ? 'linear-gradient(160deg, #13132e, #0d0d20)' : '#0f0f1a',
                boxShadow: isTodayDay
                  ? '0 0 0 1px rgba(129,140,248,0.2) inset, 0 8px 32px rgba(129,140,248,0.06)'
                  : '0 0 0 1px rgba(255,255,255,0.06) inset',
              }}
            >
              {/* Day header */}
              <div className="px-5 pt-5 pb-3 flex items-start justify-between">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest ${isTodayDay ? 'text-primary' : 'text-white/30'}`}>
                    {format(day, 'EEEE', { locale: ru })}
                  </p>
                  <p className={`text-xl font-black mt-0.5 ${isTodayDay ? 'text-white' : 'text-white/60'}`}>
                    {format(day, 'd MMMM', { locale: ru })}
                  </p>
                </div>
                {dayTasks.length > 0 && (
                  <div
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold mt-1"
                    style={{
                      background: doneCount === dayTasks.length
                        ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.04)',
                      color: doneCount === dayTasks.length ? '#818cf8' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {doneCount === dayTasks.length ? '🎉 Готово' : `${doneCount} / ${dayTasks.length}`}
                  </div>
                )}
              </div>

              {/* Wake up row */}
              <div className="flex items-center gap-2.5 px-5 pb-3">
                <AlarmClock size={13} style={{ color: 'rgba(251,191,36,0.55)', flexShrink: 0 }} />
                <span className="text-xs font-bold" style={{ color: 'rgba(251,191,36,0.55)' }}>
                  Подъём {wakeUp}
                </span>
                <span
                  className="text-[10px] font-bold rounded-md px-1.5 py-0.5"
                  style={{ color: 'rgba(52,211,153,0.7)', background: 'rgba(52,211,153,0.08)' }}
                >
                  💤 8ч
                </span>
              </div>

              {/* Morning prep block */}
              <div
                className="mx-5 mb-4 rounded-xl px-4 py-3 flex items-center gap-3"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset',
                }}
              >
                <span className="text-base shrink-0">☕</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white/35">Готовка, завтрак, сборы</p>
                  <p className="text-[11px] text-white/20 mt-0.5">{wakeUp} — {prepEnd}</p>
                </div>
                <span className="text-xs font-bold text-white/25">1.5ч</span>
              </div>

              {/* Warning if tasks don't fit before work */}
              {!fitsBeforeWork && job && sortedTasks.length > 0 && (
                <div className="px-5 pb-3">
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                    style={{
                      background: 'rgba(251,191,36,0.05)',
                      boxShadow: '0 0 0 1px rgba(251,191,36,0.15) inset',
                    }}
                  >
                    <span className="text-sm shrink-0">⚠️</span>
                    <p className="text-[11px]" style={{ color: 'rgba(251,191,36,0.65)' }}>
                      Не все задачи успеть до работы — перенеси лишние через чат
                    </p>
                  </div>
                </div>
              )}

              {/* Morning tasks — all tasks on Mac days go here */}
              {sortedTasks.length > 0 && (
                <div className="px-5 pb-4 space-y-2">
                  {job && (
                    <div className="flex items-center gap-2 mb-3">
                      <Sun size={12} style={{ color: 'rgba(251,191,36,0.45)' }} />
                      <span className="text-[11px] font-semibold text-white/25 uppercase tracking-widest">
                        До работы
                      </span>
                    </div>
                  )}
                  {sortedTasks.map(task => (
                    <ScheduleTaskCard
                      key={task.id}
                      task={task}
                      time={taskTimes[task.id]}
                      onComplete={completeTask}
                      onUncomplete={uncompleteTask}
                    />
                  ))}
                </div>
              )}

              {/* Departure row */}
              {departureTime && (
                <div className="flex items-center gap-2.5 px-5 pb-3">
                  <span style={{ fontSize: '13px', flexShrink: 0 }}>🚌</span>
                  <span className="text-xs font-bold text-white/30">
                    Выезд {departureTime}
                  </span>
                  <span className="text-[10px] text-white/15 ml-1">(40 мин до работы)</span>
                </div>
              )}

              {/* Work block */}
              {job && (
                <div
                  className="mx-5 mb-4 rounded-xl px-4 py-3.5 flex items-center gap-4"
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset',
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <Monitor size={16} className="text-white/30" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white/55">{job.label ?? 'Работа в маке'}</p>
                    <p className="text-xs text-white/25 mt-0.5">{job.start} — {job.end}</p>
                  </div>
                  <span className="text-sm font-black text-white/20">{job.start}</span>
                </div>
              )}

              {/* Home arrival row */}
              {job && (
                <div className="flex items-center gap-2.5 px-5 pb-4">
                  <Home size={13} style={{ color: 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
                  <span className="text-xs font-medium text-white/18">
                    Дома в {arrivalTime ?? minToTime(timeToMin(job.end) + COMMUTE_HOME_MIN)}
                  </span>
                </div>
              )}

              {/* Late arrival warning — arrives home after target bedtime */}
              {lateArrival && arrivalTime && (
                <div className="px-5 pb-3">
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                    style={{
                      background: 'rgba(248,113,113,0.05)',
                      boxShadow: '0 0 0 1px rgba(248,113,113,0.15) inset',
                    }}
                  >
                    <span className="text-sm shrink-0">⚠️</span>
                    <p className="text-[11px]" style={{ color: 'rgba(248,113,113,0.65)' }}>
                      Домой в {arrivalTime} — позже целевого отбоя, сон сдвинется
                    </p>
                  </div>
                </div>
              )}

              {/* Sleep ritual */}
              <div className="px-5 pb-5">
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset',
                  }}
                >
                  <span className="text-base shrink-0">🌙</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-white/35">Ритуал перед сном</p>
                    <p className="text-[11px] text-white/20 mt-0.5">Отбой {bedtime}</p>
                  </div>
                  <span className="text-xs font-black text-white/25">{sleepRitual}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {dayJobs.length === 0 && tasks.length === 0 && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: '#0f0f1a', boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset' }}
        >
          <p className="text-2xl mb-3">📅</p>
          <p className="text-sm text-muted-foreground mb-4">
            Расписание не настроено. Напиши в чате когда ты работаешь и когда хочешь учиться.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)' }}
          >
            <MessageSquare size={14} />
            Настроить в чате
          </Link>
        </div>
      )}
    </div>
  )
}

function ScheduleTaskCard({
  task,
  time,
  onComplete,
  onUncomplete,
}: {
  task: { id: string; track: string; title: string; completed: boolean; skipped: boolean; xp: number; recurringType?: string }
  time?: string | null  // null = no window before work, undefined = no time concept (free day)
  onComplete: (id: string) => void
  onUncomplete: (id: string) => void
}) {
  const color = TRACK_COLORS[task.track as keyof typeof TRACK_COLORS]

  return (
    <button
      onClick={() => {
        if (task.skipped) return
        if (task.completed) onUncomplete(task.id)
        else onComplete(task.id)
      }}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:brightness-110"
      style={{
        background: task.completed
          ? `linear-gradient(135deg, ${color}18, ${color}08)`
          : task.skipped ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
        boxShadow: task.completed
          ? `0 0 0 1px ${color}30 inset`
          : task.skipped ? '0 0 0 1px rgba(255,255,255,0.04) inset' : '0 0 0 1px rgba(255,255,255,0.08) inset',
        opacity: task.skipped ? 0.4 : 1,
        cursor: task.skipped ? 'default' : 'pointer',
      }}
    >
      {/* Emoji */}
      <div
        className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg text-base"
        style={{
          background: task.completed ? `${color}25` : 'rgba(255,255,255,0.05)',
          boxShadow: task.completed ? `0 0 8px ${color}30` : undefined,
        }}
      >
        {TRACK_EMOJI[task.track]}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: task.completed ? color : 'rgba(255,255,255,0.3)' }}
          >
            {TRACK_LABELS[task.track as keyof typeof TRACK_LABELS]}
          </p>
          {task.recurringType === 'tutor' ? (
            <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.18)' }}>
              по договорённости
            </span>
          ) : time === null ? (
            <span className="text-[10px] font-medium" style={{ color: 'rgba(248,113,113,0.45)' }}>
              нет окна
            </span>
          ) : time ? (
            <span className="text-[10px] font-bold tabular-nums" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {time}
            </span>
          ) : null}
        </div>
        <p
          className="text-sm font-semibold leading-snug truncate"
          style={{
            color: task.completed || task.skipped ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)',
            textDecoration: task.completed || task.skipped ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </p>
      </div>

      {/* XP + check */}
      <div className="shrink-0 flex items-center gap-2">
        <span className="text-xs font-bold" style={{ color: task.completed ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}>
          {task.completed ? '⚡' : '+'}{task.xp}
        </span>
        {task.completed ? (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: `${color}30` }}
            title="Нажми чтобы отменить"
          >
            <Check size={11} strokeWidth={3} style={{ color }} />
          </div>
        ) : (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div className="h-2 w-2 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>
        )}
      </div>
    </button>
  )
}

