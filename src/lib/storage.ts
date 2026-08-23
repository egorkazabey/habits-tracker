import { cloudGetItems, cloudGetKeys, cloudRemoveItems, cloudSetItem } from './cloudStore'
import { toDayOfMonth, toMonthKey } from './date'
import type { DayLog, Habit, LogsByMonth, MonthLog, MoodByMonth, MonthMood } from '../types/habit'

const HABITS_KEY = 'habits'
const LOG_PREFIX = 'logs_'
const MOOD_PREFIX = 'mood_'

export async function loadHabits(): Promise<Habit[]> {
  const values = await cloudGetItems([HABITS_KEY])
  const raw = values[HABITS_KEY]
  if (!raw) return []
  try {
    return JSON.parse(raw) as Habit[]
  } catch {
    return []
  }
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  await cloudSetItem(HABITS_KEY, JSON.stringify(habits))
}

async function loadPrefixedMonths<T>(prefix: string): Promise<Record<string, T>> {
  const keys = await cloudGetKeys()
  const matched = keys.filter((k) => k.startsWith(prefix))
  if (matched.length === 0) return {}
  const values = await cloudGetItems(matched)
  const result: Record<string, T> = {}
  for (const key of matched) {
    const raw = values[key]
    if (!raw) continue
    try {
      result[key.slice(prefix.length)] = JSON.parse(raw) as T
    } catch {
      // ignore corrupted entry
    }
  }
  return result
}

export function loadAllLogs(): Promise<LogsByMonth> {
  return loadPrefixedMonths<MonthLog>(LOG_PREFIX)
}

export function loadAllMoods(): Promise<MoodByMonth> {
  return loadPrefixedMonths<MonthMood>(MOOD_PREFIX)
}

export async function setLogValue(
  logs: LogsByMonth,
  habitId: string,
  date: Date,
  value: number,
): Promise<LogsByMonth> {
  const monthKey = toMonthKey(date)
  const day = toDayOfMonth(date)
  const monthLog: MonthLog = { ...(logs[monthKey] ?? {}) }
  const dayLog: DayLog = { ...(monthLog[day] ?? {}) }

  if (value > 0) dayLog[habitId] = value
  else delete dayLog[habitId]

  if (Object.keys(dayLog).length > 0) monthLog[day] = dayLog
  else delete monthLog[day]

  await cloudSetItem(LOG_PREFIX + monthKey, JSON.stringify(monthLog))
  return { ...logs, [monthKey]: monthLog }
}

export async function toggleBooleanCompletion(
  logs: LogsByMonth,
  habitId: string,
  date: Date,
): Promise<LogsByMonth> {
  const monthKey = toMonthKey(date)
  const day = toDayOfMonth(date)
  const current = logs[monthKey]?.[day]?.[habitId] ?? 0
  return setLogValue(logs, habitId, date, current > 0 ? 0 : 1)
}

export async function setMood(moods: MoodByMonth, date: Date, emoji: string): Promise<MoodByMonth> {
  const monthKey = toMonthKey(date)
  const day = toDayOfMonth(date)
  const monthMood: MonthMood = { ...(moods[monthKey] ?? {}) }
  monthMood[day] = emoji
  await cloudSetItem(MOOD_PREFIX + monthKey, JSON.stringify(monthMood))
  return { ...moods, [monthKey]: monthMood }
}

async function deleteHabitFromLogs(habitId: string, logs: LogsByMonth): Promise<LogsByMonth> {
  const next: LogsByMonth = {}
  const writes: Promise<void>[] = []
  for (const [monthKey, monthLog] of Object.entries(logs)) {
    const updated: MonthLog = {}
    for (const [day, dayLog] of Object.entries(monthLog)) {
      const filtered = { ...dayLog }
      delete filtered[habitId]
      if (Object.keys(filtered).length > 0) updated[day] = filtered
    }
    next[monthKey] = updated
    writes.push(cloudSetItem(LOG_PREFIX + monthKey, JSON.stringify(updated)))
  }
  await Promise.all(writes)
  return next
}

export async function deleteHabit(habits: Habit[], logs: LogsByMonth, habitId: string) {
  const nextHabits = habits.filter((h) => h.id !== habitId)
  await saveHabits(nextHabits)
  const nextLogs = await deleteHabitFromLogs(habitId, logs)
  return { habits: nextHabits, logs: nextLogs }
}

export async function wipeAllData() {
  const keys = await cloudGetKeys()
  await cloudRemoveItems(keys)
}
