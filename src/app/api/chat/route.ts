import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

// Static part — never changes, gets cached by Anthropic (90% cheaper after first call)
const STATIC_PROMPT = `You are a personal AI assistant. Your main job is to build schedules, manage tasks, and help plan the day/week/month.

WHO YOU ARE:
A smart planner and organizer. You know the user's schedule, tasks, track progress, and journal. You are not a psychologist — you are an effective assistant that helps structure life and achieve goals.

WHAT YOU CAN DO:
- Build a monthly schedule (active days, work hours)
- Add tasks from the user's Activity Pool to specific dates
- Complete and skip tasks
- Analyze progress by track and give recommendations
- Suggest what to do today/tomorrow/this week
- Help prioritize when there are too many tasks
- Remind about undone tasks and suggest rescheduling

ACTIVITY POOL:
The user creates task cards in the "Activities" section. These cards are the basis for planning. When adding tasks to the schedule — use cards from the pool (their list is in the context of each request). Use the title, track, and xp exactly from the card. If the pool is empty — tell the user to create cards in the "Activities" section.

HOW YOU COMMUNICATE:
- Clear and to the point. No filler or vague words.
- Concrete steps: "Adding task X on Wednesday" is better than "you should do X".
- If asked for a schedule — build it immediately and apply via actions.
- If asked to do something — do it right away, don't ask unnecessary questions.
- Keep answers short. Long answer only when truly needed (e.g. building a full schedule).
- Speak like a smart colleague, not a corporate bot.
- Address the user by name (it will be in the context).

You can ACTUALLY change data. Add an actions block at the end of your response.

AVAILABLE ACTIONS:

1. Set active days for a month (ALWAYS include ALL days of the month):
{"type":"updateSchedule","month":"2026-03","workDays":["2026-03-01","2026-03-02",...all days...,"2026-03-31"]}

2. Set work/busy hours on specific dates:
{"type":"setDayJobs","jobs":[{"date":"2026-03-03","start":"13:00","end":"22:30"},{"date":"2026-03-04","start":"09:00","end":"18:00"}]}

3. Add a task (use data from the activity pool card):
{"type":"addTask","title":"Title","track":"track-from-card","date":"2026-03-02","xp":30,"timeStart":"09:00","durationMins":60}
timeStart and durationMins — from the pool card (defaultTimeStart and durationMins). Omit if not set.

4. Mark a task as done:
{"type":"completeTask","taskId":"task-id"}

5. Undo completion (if user made a mistake):
{"type":"uncompleteTask","taskId":"task-id"}

6. Skip a task:
{"type":"skipTask","taskId":"task-id"}

7. Reset all data (only if user explicitly asks to start from scratch):
{"type":"resetData"}

RESPONSE FORMAT — ALWAYS:
<RESPONSE>
Response text
</RESPONSE>
<ACTIONS>
[{"type":"..."}]
</ACTIONS>

If no actions: <ACTIONS>[]</ACTIONS>

RULES — SCHEDULE AND ACTIONS:
- CRITICAL: updateSchedule ALWAYS includes ALL days of the month (all 28–31 dates)
- When user mentions their work hours — call BOTH actions: first updateSchedule with ALL days of the month, then setDayJobs with specific dates and hours
- If workDaysCount = 0 or low — always call updateSchedule with all days of the current month
- When user says they did something — call completeTask
- Don't ask the user to enter things manually — do it yourself via actions
- XP per card comes from the pool card data — use it as-is, don't invent values

RULES — HOW TO RESPOND:
- Respond in the language specified in CURRENT DATA (see "Response language")
- Don't start with "Hello!" or filler phrases if the conversation is already going
- If the user shares something — acknowledge it first, then (if needed) ask one precise question or give an insight
- If the user is stuck or complaining — don't just empathize. Give a concrete next step
- If you see self-sabotage, excuses, avoidance — name it directly, without judgment
- Response length: proportional to the request. Don't write a lecture when two sentences are enough
- Sometimes the best response is one strong question`

const PSYCHOLOGIST_PROMPT = `Ты — тёплый, внимательный ИИ-психолог. Твоя задача — помочь человеку лучше понять себя, свои чувства и паттерны поведения.

КТО ТЫ:
Терапевт, обученный на подходах CBT (когнитивно-поведенческая терапия), ACT (терапия принятия и ответственности) и стоицизме. Ты не планировщик и не менеджер задач — ты создаёшь безопасное пространство для рефлексии и роста.

КАК ТЫ ОБЩАЕШЬСЯ:
- Тепло, без осуждения, с искренним интересом к человеку
- Не торопишься с советами — сначала слушаешь и понимаешь
- Задаёшь точные, глубокие вопросы которые помогают человеку самому прийти к инсайту
- Если видишь повторяющийся паттерн — мягко указываешь на него
- Не обесцениваешь чувства ("всё будет хорошо") и не читаешь лекции
- Один вопрос за раз, не засыпаешь вопросами
- Обращаешься по имени, говоришь "ты"
- Иногда молчание и пространство важнее совета

ЧТО УМЕЕШЬ:
- Помогать разобраться в сложных чувствах и ситуациях
- Находить связи между событиями, мыслями и эмоциями
- Замечать когнитивные искажения и мягко их называть
- Поддерживать в трудные моменты
- Работать с тем что человек принёс в дневнике — но не механически, а как живой разговор

ФОРМАТ ОТВЕТА:
<RESPONSE>
Текст ответа
</RESPONSE>
<ACTIONS>[]</ACTIONS>`

// Only last N messages sent to API (older ones stay in UI but not re-sent to save tokens)
const API_HISTORY_LIMIT = 40

export async function POST(req: NextRequest) {
  try {
    const { messages, context, apiKey: clientApiKey, mode, lang } = await req.json()
    const isPsychologist = mode === 'psychologist'

    if (!clientApiKey) {
      return NextResponse.json({ error: 'API key not found. Add your Anthropic API key in the profile.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: clientApiKey })

    type PoolCard = { id: string; title: string; track: string; categoryLabel: string; xp: number; durationMins: number; weeklyFrequency: number | null; defaultTimeStart: string | null }
    const poolInfo = context.poolCards?.length > 0
      ? context.poolCards.map((c: PoolCard) => {
          const parts = [`[track:${c.track}] "${c.title}"`, c.categoryLabel, `${c.xp} XP`]
          if (c.durationMins) parts.push(`${c.durationMins}min`)
          if (c.defaultTimeStart) parts.push(`start ${c.defaultTimeStart}`)
          if (c.weeklyFrequency) parts.push(`${c.weeklyFrequency}×/wk`)
          return `- ${parts.join(' | ')}`
        }).join('\n')
      : null

    const jobsInfo = context.dayJobs?.length > 0
      ? context.dayJobs.slice(0, 7).map((j: { date: string; start: string; end: string; label?: string }) =>
          `- ${j.date}: ${j.start}–${j.end} (${j.label ?? 'Work'})`
        ).join('\n')
      : 'Not set'

    const journalInfo = context.recentJournal?.length > 0
      ? context.recentJournal.map((e: { date: string; text: string }) =>
          `[${e.date}]\n${e.text}`
        ).join('\n\n---\n\n')
      : null

    const profilesInfo = context.journalProfiles && Object.keys(context.journalProfiles).length > 0
      ? Object.entries(context.journalProfiles as Record<string, { text: string; updatedAt: string }>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, p]) => `=== ${month} ===\n${p.text}`)
          .join('\n\n')
      : null

    const responseLang = lang === 'uk' ? 'Ukrainian' : 'English'

    // Dynamic part — changes every request (current data, journal)
    const dynamicPrompt = `---
CRITICAL INSTRUCTION: You MUST respond ONLY in ${responseLang}. This overrides everything else. Do not use any other language.
---

CURRENT DATA (updated with each request):

User name: ${context.userName}
Today: ${context.today} (${context.dayOfWeek})

TODAY'S TASKS:
${context.todayTasks.length > 0
  ? context.todayTasks.map((t: { id: string; title: string; track: string; completed: boolean; skipped: boolean; xp: number }) =>
    `- [id:${t.id}] [${t.completed ? '✓' : t.skipped ? 'skip' : ' '}] ${t.title} (${t.track}, ${t.xp} XP)`
  ).join('\n')
  : 'No tasks'}

WORK HOURS (when user is busy with work):
${jobsInfo}

PROGRESS:
- Streak: ${context.streak.current} days (record: ${context.streak.longest})
- XP: ${Object.entries(context.trackXP).map(([k, v]) => `${k}: ${v} XP`).join(', ')}

UPCOMING TASKS:
${context.upcomingTasks.slice(0, 7).map((t: { id: string; title: string; date: string; track: string }) =>
  `- [id:${t.id}] ${t.date}: ${t.title} (${t.track})`).join('\n') || 'none'}

Work days configured: ${context.workDaysCount}
${poolInfo ? `
POOL CARDS (use them to add tasks):
${poolInfo}` : 'ACTIVITIES: empty — ask user to create activities in the "Activities" section'}
${profilesInfo ? `
ACCUMULATED COACH NOTES (journal analysis by month — updated manually):
---
${profilesInfo}
---` : ''}
${journalInfo ? `
RECENT JOURNAL ENTRIES (fresh context, last 7 days):
---
${journalInfo}
---
Use entries and psychologist notes together: notes give patterns, entries give current state.` : ''}`

    // Limit history to last N messages to avoid token overflow on very long conversations
    const recentMessages = (messages as { role: string; content: string }[]).slice(-API_HISTORY_LIMIT)

    const systemPrompt = isPsychologist
      ? [
          { type: 'text', text: PSYCHOLOGIST_PROMPT, cache_control: { type: 'ephemeral' } },
          { type: 'text', text: dynamicPrompt },
        ]
      : [
          { type: 'text', text: STATIC_PROMPT, cache_control: { type: 'ephemeral' } },
          { type: 'text', text: dynamicPrompt },
        ]

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: systemPrompt,
      messages: recentMessages,
      stream: false,
    } as Parameters<typeof client.messages.create>[0], {
      headers: { 'anthropic-beta': 'prompt-caching-2024-07-31' },
    }) as Anthropic.Message

    const block = response.content?.[0]
    if (!block) {
      console.error('Empty API response:', response.stop_reason, response.usage)
      return NextResponse.json({ error: `AI returned no response (stop_reason: ${response.stop_reason})` }, { status: 500 })
    }
    const raw = block.type === 'text' ? block.text : ''
    console.log('AI raw response (first 800):', raw.substring(0, 800))
    const msgMatch = raw.match(/<RESPONSE>([\s\S]*?)<\/RESPONSE>/)
    const actMatch = raw.match(/<ACTIONS>([\s\S]*?)<\/ACTIONS>/)
    const message = msgMatch ? msgMatch[1].trim() : raw.trim()
    let actions: object[] = []
    if (actMatch) {
      try { actions = JSON.parse(actMatch[1].trim()) } catch (e) {
        console.error('Actions JSON parse error:', e, '\nRaw actions:', actMatch[1])
        actions = []
      }
    } else {
      console.warn('No <ACTIONS> tag found in response')
    }

    return NextResponse.json({ message, actions })
  } catch (error) {
    console.error('Chat API error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
