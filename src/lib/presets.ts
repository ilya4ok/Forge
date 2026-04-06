export const PRESET_LIST = [
  { key: 'sport',    label: 'Спорт',      color: '#f87171', emoji: '🏃', mottos: ['Каждая тренировка делает тебя сильнее!', 'Движение — жизнь!', 'Боль временна, гордость — навсегда!'] },
  { key: 'study',    label: 'Учёба',      color: '#60a5fa', emoji: '📚', mottos: ['Знание — сила!', 'Умный человек учится всю жизнь!', 'Сегодняшний труд — завтрашний успех!'] },
  { key: 'work',     label: 'Работа',     color: '#818cf8', emoji: '💻', mottos: ['Успех — сумма малых усилий!', 'Продуктивный день — шаг к мечте!'] },
  { key: 'rest',     label: 'Отдых',      color: '#34d399', emoji: '🛋️', mottos: ['Перезарядка — часть пути к успеху!', 'Забота о себе — это мудрость!'] },
  { key: 'creative', label: 'Творчество', color: '#f472b6', emoji: '🎨', mottos: ['Твори — и мир станет лучше!', 'Вдохновение рождается в действии!'] },
  { key: 'finance',  label: 'Финансы',    color: '#fbbf24', emoji: '💰', mottos: ['Финансовая свобода начинается здесь!', 'Контроль финансов — контроль жизни!'] },
  { key: 'health',   label: 'Здоровье',   color: '#4ade80', emoji: '🥗', mottos: ['Здоровье — твой главный капитал!', 'Береги себя — ты бесценен!'] },
  { key: 'other',    label: 'Другое',     color: '#94a3b8', emoji: '📋', mottos: ['Каждое дело важно — ты справишься!', 'Главное — начать!'] },
] as const

export type PresetKey = typeof PRESET_LIST[number]['key']

export function getPreset(key: string) {
  return PRESET_LIST.find(p => p.key === key) ?? PRESET_LIST[PRESET_LIST.length - 1]
}
