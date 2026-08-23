import { getWebApp } from './telegram'
import type { Habit } from '../types/habit'

const API_URL = import.meta.env.VITE_REMINDERS_API_URL as string | undefined

interface ReminderRow {
  habitId: string
  habitName: string
  message: string
  hourUtc: number
  minuteUtc: number
  weekdaysMask: number
}

function activeWeekdaysToMask(weekdays: number[]) {
  return weekdays.reduce((mask, day) => mask | (1 << day), 0)
}

/** Shifts a Mon(0)..Sun(6) weekday bitmask by `shift` days (wrapping), for the local->UTC day-boundary crossing. */
function shiftWeekdaysMask(mask: number, shift: number) {
  let result = 0
  for (let day = 0; day < 7; day++) {
    if (mask & (1 << day)) result |= 1 << ((day + shift + 7) % 7)
  }
  return result
}

function toReminderRows(habit: Habit): ReminderRow[] {
  if (!habit.reminders || habit.reminders.length === 0) return []
  const baseMask = activeWeekdaysToMask(habit.activeWeekdays)
  return habit.reminders.map(({ time }) => {
    const [hour, minute] = time.split(':').map(Number)
    const now = new Date()
    const local = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute)
    // Local weekday (getDay) vs. that same instant's UTC weekday (getUTCDay) — how many days the
    // local time shifts once expressed in UTC, e.g. 23:30 local in UTC+2 lands on the next UTC day.
    const dayShift = local.getUTCDay() - local.getDay()
    return {
      habitId: habit.id,
      habitName: habit.name,
      message: habit.reminderMessage || habit.name,
      hourUtc: local.getUTCHours(),
      minuteUtc: local.getUTCMinutes(),
      weekdaysMask: shiftWeekdaysMask(baseMask, dayShift),
    }
  })
}

/**
 * Pushes the full current set of reminders (across all habits) to the reminders backend, replacing
 * whatever it has stored for this Telegram user. No-op if VITE_REMINDERS_API_URL isn't configured —
 * the in-app Reminders UI still works locally, it just won't trigger real Telegram notifications
 * until a worker is deployed (see README).
 */
export async function syncAllReminders(habits: Habit[]) {
  if (!API_URL) return
  const initData = getWebApp()?.initData
  if (!initData) return

  const reminders = habits.flatMap(toReminderRows)
  try {
    await fetch(`${API_URL}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, reminders }),
    })
  } catch {
    // Best-effort: habit data itself already lives safely in CloudStorage regardless.
  }
}
