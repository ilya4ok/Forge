export type AchievementTier = 'easy' | 'medium' | 'hard'

export type AchievementDef = {
  id: string
  emoji: string
  label: string
  desc: string
  tier: AchievementTier
}

export const ALL_ACHIEVEMENTS: AchievementDef[] = [
  // ── Easy ────────────────────────────────────────────────────────────────
  { id: 'first-task',      emoji: '🎯', label: 'First Step',        desc: 'Complete your first task',                    tier: 'easy' },
  { id: 'tasks-5',         emoji: '✅', label: 'High Five',         desc: 'Complete 5 tasks',                            tier: 'easy' },
  { id: 'tasks-10',        emoji: '📋', label: 'Ten Done',          desc: 'Complete 10 tasks',                           tier: 'easy' },
  { id: 'tasks-20',        emoji: '🗒️', label: 'Twenty Strong',     desc: 'Complete 20 tasks',                           tier: 'easy' },
  { id: 'tasks-30',        emoji: '📌', label: 'Thirty Club',       desc: 'Complete 30 tasks',                           tier: 'easy' },
  { id: 'streak-3',        emoji: '🌱', label: '3-Day Streak',      desc: 'Streak of 3 days',                            tier: 'easy' },
  { id: 'streak-7',        emoji: '🔥', label: 'One Week',          desc: 'Streak of 7 days',                            tier: 'easy' },
  { id: 'streak-14',       emoji: '🌊', label: 'Two Weeks',         desc: 'Streak of 14 days',                           tier: 'easy' },
  { id: 'total-100',       emoji: '⚡', label: '100 XP',            desc: 'Earn 100 XP',                                 tier: 'easy' },
  { id: 'total-250',       emoji: '✨', label: '250 XP',            desc: 'Earn 250 XP',                                 tier: 'easy' },
  { id: 'total-500',       emoji: '💫', label: '500 XP',            desc: 'Earn 500 XP',                                 tier: 'easy' },
  { id: 'journal-1',       emoji: '📝', label: 'Journal Opened',    desc: 'Write your first journal entry',              tier: 'easy' },
  { id: 'journal-5',       emoji: '📖', label: 'Five Stories',      desc: '5 journal entries',                           tier: 'easy' },
  { id: 'journal-10',      emoji: '📚', label: 'Journalist',        desc: '10 journal entries',                          tier: 'easy' },
  { id: 'category-first',  emoji: '🗂️', label: 'Organizer',         desc: 'Create your first activity category',         tier: 'easy' },
  { id: 'pool-first',      emoji: '🃏', label: 'First Card',        desc: 'Add your first activity to the pool',         tier: 'easy' },
  { id: 'pool-3',          emoji: '🎴', label: 'Mini Pool',         desc: '3 activities in the pool',                   tier: 'easy' },
  { id: 'pool-5',          emoji: '🃏', label: 'Collector',         desc: '5 activities in the pool',                   tier: 'easy' },
  { id: 'schedule-setup',  emoji: '📅', label: 'Planner',           desc: 'Set up your work schedule',                  tier: 'easy' },
  { id: 'chat-first',      emoji: '💬', label: 'First Contact',     desc: 'Send at least one message to the assistant',  tier: 'easy' },
  { id: 'longest-7',       emoji: '🏅', label: 'Record: Week',      desc: 'Longest streak of 7+ days',                  tier: 'easy' },
  { id: 'xp-sport-100',    emoji: '🏃', label: 'Rookie Athlete',    desc: '100 XP in Sport category',                   tier: 'easy' },
  { id: 'xp-study-100',    emoji: '📖', label: 'First Knowledge',   desc: '100 XP in Study category',                   tier: 'easy' },
  { id: 'categories-3',    emoji: '🌈', label: '3 Categories',      desc: 'Create 3 different activity categories',      tier: 'easy' },
  { id: 'journal-profile', emoji: '🧠', label: 'Self-Analysis',     desc: 'Create your first psychological profile',     tier: 'easy' },
  // ── Medium ──────────────────────────────────────────────────────────────
  { id: 'tasks-50',        emoji: '📦', label: '50 Tasks',          desc: 'Complete 50 tasks',                           tier: 'medium' },
  { id: 'tasks-75',        emoji: '🎖️', label: '75 Tasks',          desc: 'Complete 75 tasks',                           tier: 'medium' },
  { id: 'tasks-100',       emoji: '🏆', label: 'Century',           desc: 'Complete 100 tasks',                          tier: 'medium' },
  { id: 'tasks-150',       emoji: '🥇', label: '150 Tasks',         desc: 'Complete 150 tasks',                          tier: 'medium' },
  { id: 'streak-21',       emoji: '🔥', label: '21 Days',           desc: 'Streak of 21 days — habit formed',            tier: 'medium' },
  { id: 'streak-30',       emoji: '🌙', label: 'One Month',         desc: 'Streak of 30 days',                           tier: 'medium' },
  { id: 'streak-60',       emoji: '🌟', label: '60 Days',           desc: 'Streak of 60 days',                           tier: 'medium' },
  { id: 'total-1000',      emoji: '⚡', label: '1 000 XP',          desc: 'Earn 1 000 XP',                               tier: 'medium' },
  { id: 'total-2000',      emoji: '🔋', label: '2 000 XP',          desc: 'Earn 2 000 XP',                               tier: 'medium' },
  { id: 'total-5000',      emoji: '💎', label: '5 000 XP',          desc: 'Earn 5 000 XP',                               tier: 'medium' },
  { id: 'journal-25',      emoji: '📖', label: 'Chronicler',        desc: '25 journal entries',                          tier: 'medium' },
  { id: 'journal-50',      emoji: '📚', label: 'Writer',            desc: '50 journal entries',                          tier: 'medium' },
  { id: 'pool-10',         emoji: '🗃️', label: 'Arsenal',           desc: '10 activities in the pool',                  tier: 'medium' },
  { id: 'pool-20',         emoji: '🗂️', label: 'Library',           desc: '20 activities in the pool',                  tier: 'medium' },
  { id: 'xp-sport-500',    emoji: '💪', label: 'Athlete',           desc: '500 XP in Sport category',                   tier: 'medium' },
  { id: 'xp-study-500',    emoji: '🎓', label: 'Student',           desc: '500 XP in Study category',                   tier: 'medium' },
  { id: 'xp-finance-200',  emoji: '💰', label: 'Investor',          desc: '200 XP in Finance category',                 tier: 'medium' },
  { id: 'categories-5',    emoji: '🌍', label: '5 Categories',      desc: 'Create 5 different categories',               tier: 'medium' },
  { id: 'longest-30',      emoji: '🏆', label: 'Record: Month',     desc: 'Longest streak of 30+ days',                 tier: 'medium' },
  { id: 'chat-10',         emoji: '🤖', label: 'Regular',           desc: '10+ messages to the assistant',               tier: 'medium' },
  // ── Hard ────────────────────────────────────────────────────────────────
  { id: 'streak-100',      emoji: '🔥', label: '100 Days',          desc: 'Streak of 100 days',                          tier: 'hard' },
  { id: 'streak-200',      emoji: '🌋', label: '200 Days',          desc: 'Streak of 200 days',                          tier: 'hard' },
  { id: 'streak-365',      emoji: '👑', label: 'Full Year',         desc: 'Streak of 365 days',                          tier: 'hard' },
  { id: 'tasks-250',       emoji: '🎯', label: '250 Tasks',         desc: 'Complete 250 tasks',                          tier: 'hard' },
  { id: 'tasks-500',       emoji: '🏭', label: '500 Tasks',         desc: 'Complete 500 tasks',                          tier: 'hard' },
  { id: 'tasks-1000',      emoji: '🚀', label: '1 000 Tasks',       desc: 'Complete 1 000 tasks — a true marathon',      tier: 'hard' },
  { id: 'total-10000',     emoji: '🌟', label: '10 000 XP',         desc: 'Earn 10 000 XP',                              tier: 'hard' },
  { id: 'total-20000',     emoji: '🌠', label: '20 000 XP',         desc: 'Earn 20 000 XP',                              tier: 'hard' },
  { id: 'total-50000',     emoji: '👑', label: '50 000 XP',         desc: 'Earn 50 000 XP — a legend',                   tier: 'hard' },
  { id: 'all-tracks',      emoji: '🎖️', label: 'All-Rounder',       desc: 'Earn XP in 5+ different categories',          tier: 'hard' },
  { id: 'longest-100',     emoji: '🏆', label: 'Record: 100',       desc: 'Longest streak of 100+ days',                 tier: 'hard' },
  { id: 'journal-100',     emoji: '📜', label: 'Diarist',           desc: '100 journal entries',                         tier: 'hard' },
  { id: 'pool-50',         emoji: '🗄️', label: 'Megapool',          desc: '50 activities in the pool',                  tier: 'hard' },
  { id: 'categories-8',    emoji: '🌐', label: 'Well-Rounded',      desc: 'Create 8 or more categories',                 tier: 'hard' },
  { id: 'xp-all-1000',     emoji: '🔮', label: 'Polymath',          desc: 'Earn 1 000+ XP in three different categories', tier: 'hard' },
]

export const ACHIEVEMENT_MAP = Object.fromEntries(ALL_ACHIEVEMENTS.map(a => [a.id, a]))

export const TIER_COLORS: Record<AchievementTier, { color: string; bg: string; border: string }> = {
  easy:   { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)' },
  hard:   { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
}
