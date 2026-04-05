import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { month, entries, existingProfiles, userName, apiKey, lang } = await req.json()

    if (!apiKey) {
      return NextResponse.json({ error: 'Add your Anthropic API key in the profile' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey })
    const name = (userName as string)?.trim() || 'user'
    const isUk = lang === 'uk'

    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: 'No entries for this month' }, { status: 400 })
    }

    const entriesText = entries
      .sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date))
      .map((e: { date: string; text: string }) => `[${e.date}]\n${e.text}`)
      .join('\n\n---\n\n')

    const previousProfilesText = Object.entries(existingProfiles || {})
      .filter(([m]) => m !== month)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([m, p]) => `=== ${m} ===\n${(p as { text: string }).text}`)
      .join('\n\n')

    const systemPrompt = isUk
      ? `Ти — досвідчений психолог. Твоє завдання — створити точні "нотатки психолога" на основі щоденникових записів людини на ім'я ${name}.

Ці нотатки будуть використовуватись як контекст для AI-асистента, який допомагає ${name} у повсякденному житті. Чим точніші та кориснішими нотатки — тим краще асистент зможе йому допомогти.

ЩО ВКЛЮЧИТИ В НОТАТКИ (близько 500 слів):

1. ПАТЕРНИ ПОВЕДІНКИ — що повторюється? Що він/вона робить коли втомлюється, стресує, відкладає?
2. ЩО РЕАЛЬНО ПРАЦЮЄ — які підходи, рішення, оточення допомагають рухатись?
3. ЗАСТРЯГЛІ ТОЧКИ — де він/вона буксує знову і знову? Які страхи, сумніви, уникання?
4. ЕНЕРГІЯ — що заряджає? Що виснажує?
5. КЛЮЧОВІ ТЕМИ МІСЯЦЯ — про що думав/ла, що переживав/ла, що змінювалось?
6. ПРОТИРІЧЧЯ — розбіжності між тим що говорить і що робить?
7. ДИНАМІКА — є прогрес, регрес, стагнація?

СТИЛЬ:
- Пиши від третьої особи ("${name} схильний...", "Він/вона помічає...")
- Конкретно і чесно. Без лестощів, без осуду.
- Використовуй прямі спостереження із записів, а не абстрактні висновки.
- Це нотатки для спеціаліста, не для самого ${name} — пиши чесно про слабкі місця.`
      : `You are an experienced psychologist. Your task is to create precise "psychologist's notes" based on the diary entries of a person named ${name}.

These notes will be used as context for an AI assistant that helps ${name} in everyday life. The more accurate and useful the notes — the better the assistant can help.

WHAT TO INCLUDE (around 500 words):

1. BEHAVIORAL PATTERNS — what repeats? What does ${name} do when tired, stressed, procrastinating?
2. WHAT ACTUALLY WORKS — which approaches, decisions, environments help them move forward?
3. STUCK POINTS — where do they get stuck repeatedly? What fears, doubts, avoidance patterns?
4. ENERGY — what charges them? What drains them?
5. KEY THEMES OF THE MONTH — what were they thinking about, feeling, what changed?
6. CONTRADICTIONS — gaps between what they say and what they do?
7. DYNAMICS — is there progress, regression, stagnation?

STYLE:
- Write in third person ("${name} tends to...", "They notice...")
- Specific and honest. No flattery, no judgment.
- Use direct observations from the entries, not abstract conclusions.
- These are notes for a specialist, not for ${name} themselves — be honest about weak points.`

    const userMessage = previousProfilesText
      ? isUk
        ? `ПОПЕРЕДНІ МІСЯЦІ (контекст для порівняння динаміки):\n${previousProfilesText}\n\n===\n\nЗАПИСИ ЗА ${month}:\n${entriesText}\n\nСтвори нотатки психолога за ${month}. Врахуй динаміку відносно попередніх місяців якщо вона є.`
        : `PREVIOUS MONTHS (context for comparing dynamics):\n${previousProfilesText}\n\n===\n\nENTRIES FOR ${month}:\n${entriesText}\n\nCreate psychologist's notes for ${month}. Consider the dynamics relative to previous months if any.`
      : isUk
        ? `ЗАПИСИ ЗА ${month}:\n${entriesText}\n\nСтвори нотатки психолога за ${month}.`
        : `ENTRIES FOR ${month}:\n${entriesText}\n\nCreate psychologist's notes for ${month}.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const block = response.content?.[0]
    if (!block || block.type !== 'text') {
      return NextResponse.json({ error: 'AI returned no response' }, { status: 500 })
    }

    return NextResponse.json({ profile: block.text.trim() })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
