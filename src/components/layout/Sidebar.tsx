'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Calendar,
  CheckSquare, BarChart2, Flame, Zap,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/',          icon: LayoutDashboard, label: 'Главная' },
  { href: '/chat',      icon: MessageSquare,   label: 'AI Чат' },
  { href: '/schedule',  icon: Calendar,         label: 'Расписание' },
  { href: '/tasks',     icon: CheckSquare,      label: 'Задачи' },
  { href: '/stats',     icon: BarChart2,        label: 'Статистика' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { streak, trackXP } = useStore()
  const totalXP = Object.values(trackXP).reduce((a, b) => a + b, 0)

  return (
    <aside className="flex w-16 flex-col items-center border-r border-border bg-sidebar py-5 lg:w-60 lg:items-start lg:px-4">

      {/* Logo */}
      <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-xl lg:w-full lg:rounded-2xl lg:h-auto lg:py-0"
        style={{ background: 'none' }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
          style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)' }}
        >
          И
        </div>
        <span className="ml-3 hidden text-sm font-semibold text-foreground lg:block">
          Личный дашборд
        </span>
      </div>

      {/* Nav */}
      <nav className="flex w-full flex-col gap-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative flex h-10 items-center justify-center rounded-xl transition-all duration-150 lg:justify-start lg:gap-3 lg:px-3',
                active
                  ? 'text-primary'
                  : 'text-sidebar-foreground hover:text-foreground'
              )}
              style={active ? {
                background: 'linear-gradient(135deg, rgba(129,140,248,0.15), rgba(167,139,250,0.08))',
                boxShadow: '0 0 0 1px rgba(129,140,248,0.12) inset',
              } : undefined}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full"
                  style={{ background: '#818cf8' }}
                />
              )}
              <Icon size={17} className={cn('shrink-0', active ? 'text-primary' : '')} />
              <span className="hidden text-sm font-medium lg:block">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      {/* Streak + XP */}
      <div className="flex w-full flex-col gap-2">
        <div
          className="flex items-center justify-center gap-3 rounded-xl px-3 py-3 lg:justify-start"
          style={{
            background: 'linear-gradient(135deg, rgba(251,146,60,0.12), rgba(251,146,60,0.04))',
            boxShadow: '0 0 0 1px rgba(251,146,60,0.1) inset',
          }}
        >
          <Flame size={18} className="shrink-0 text-orange-400" />
          <div className="hidden lg:block">
            <p className="text-xs text-orange-400/60">Стрик</p>
            <p className="text-sm font-bold text-orange-300">{streak.current} дней</p>
          </div>
          <span className="text-sm font-bold text-orange-300 lg:hidden">{streak.current}</span>
        </div>

        <div
          className="flex items-center justify-center gap-3 rounded-xl px-3 py-3 lg:justify-start"
          style={{
            background: 'linear-gradient(135deg, rgba(129,140,248,0.12), rgba(129,140,248,0.04))',
            boxShadow: '0 0 0 1px rgba(129,140,248,0.1) inset',
          }}
        >
          <Zap size={18} className="shrink-0 text-primary" />
          <div className="hidden lg:block">
            <p className="text-xs text-primary/60">Опыт</p>
            <p className="text-sm font-bold text-primary">{totalXP} XP</p>
          </div>
          <span className="text-sm font-bold text-primary lg:hidden">{totalXP}</span>
        </div>
      </div>
    </aside>
  )
}
