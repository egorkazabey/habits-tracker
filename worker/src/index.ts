import { verifyInitData } from './telegramAuth'

export interface Env {
  DB: D1Database
  BOT_TOKEN: string
}

interface ReminderInput {
  habitId: string
  habitName: string
  message: string
  hourUtc: number
  minuteUtc: number
  weekdaysMask: number
}

interface ReminderRow {
  telegram_user_id: number
  habit_name: string
  message: string
  weekdays_mask: number
}

function isValidReminder(r: unknown): r is ReminderInput {
  if (typeof r !== 'object' || r === null) return false
  const x = r as Record<string, unknown>
  return (
    typeof x.habitId === 'string' &&
    typeof x.habitName === 'string' &&
    typeof x.message === 'string' &&
    typeof x.hourUtc === 'number' &&
    x.hourUtc >= 0 &&
    x.hourUtc <= 23 &&
    typeof x.minuteUtc === 'number' &&
    x.minuteUtc >= 0 &&
    x.minuteUtc <= 59 &&
    typeof x.weekdaysMask === 'number' &&
    x.weekdaysMask >= 0 &&
    x.weekdaysMask <= 0b1111111
  )
}

async function handleSyncReminders(request: Request, env: Env): Promise<Response> {
  let body: { initData?: string; reminders?: unknown[] }
  try {
    body = await request.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }
  if (!body.initData) return new Response('Missing initData', { status: 400 })

  const userId = await verifyInitData(body.initData, env.BOT_TOKEN)
  if (userId === null) return new Response('Unauthorized', { status: 401 })

  const reminders = (Array.isArray(body.reminders) ? body.reminders : []).filter(isValidReminder)

  await env.DB.prepare('DELETE FROM reminders WHERE telegram_user_id = ?').bind(userId).run()

  if (reminders.length > 0) {
    const insert = env.DB.prepare(
      'INSERT INTO reminders (telegram_user_id, habit_id, habit_name, message, hour_utc, minute_utc, weekdays_mask) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    await env.DB.batch(
      reminders.map((r) => insert.bind(userId, r.habitId, r.habitName, r.message, r.hourUtc, r.minuteUtc, r.weekdaysMask)),
    )
  }

  return new Response(JSON.stringify({ ok: true, count: reminders.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

async function sendReminder(botToken: string, chatId: number, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === 'POST' && url.pathname === '/reminders') {
      return handleSyncReminders(request, env)
    }
    return new Response('Not found', { status: 404 })
  },

  async scheduled(event: ScheduledController, env: Env): Promise<void> {
    const now = new Date(event.scheduledTime)
    const hourUtc = now.getUTCHours()
    const minuteUtc = now.getUTCMinutes()
    const weekdayMonFirst = (now.getUTCDay() + 6) % 7 // 0=Mon..6=Sun, matching the frontend's convention

    const { results } = await env.DB.prepare(
      'SELECT telegram_user_id, habit_name, message, weekdays_mask FROM reminders WHERE hour_utc = ? AND minute_utc = ?',
    )
      .bind(hourUtc, minuteUtc)
      .all<ReminderRow>()

    const due = (results ?? []).filter((r) => (r.weekdays_mask & (1 << weekdayMonFirst)) !== 0)

    await Promise.allSettled(due.map((r) => sendReminder(env.BOT_TOKEN, r.telegram_user_id, `⏰ ${r.message}`)))
  },
}
