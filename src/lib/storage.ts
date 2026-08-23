import { cloudGetItems, cloudGetKeys, cloudSetItem } from './cloudStore'
import { toDayOfMonth, toMonthKey } from './date'
import type { Habit, LogsByMonth, MonthLog } from '../types/habit'

const HABITS_KEY = 'habits'
const LOG_PREFIX = 'logs_'

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

export async function deleteHabitLogs(habitId: string, logs: LogsByMonth): Promise<LogsByMonth> {
  const next: LogsByMonth = {}
  const keysToSave: [string, MonthLog][] = []
  for (const [monthKey, monthLog] of Object.entries(logs)) {
    const updated: MonthLog = {}
    for (const [day, ids] of Object.entries(monthLog)) {
      const filtered = ids.filter((id) => id !== habitId)
      if (filtered.length > 0) updated[day] = filtered
    }
    next[monthKey] = updated
    keysToSave.push([monthKey, updated])
  }
  await Promise.all(keysToSave.map(([monthKey, monthLog]) => cloudSetItem(LOG_PREFIX + monthKey, JSON.stringify(monthLog))))
  return next
}

export async function loadAllLogs(): Promise<LogsByMonth> {
  const keys = await cloudGetKeys()
  const logKeys = keys.filter((k) => k.startsWith(LOG_PREFIX))
  if (logKeys.length === 0) return {}
  const values = await cloudGetItems(logKeys)
  const logs: LogsByMonth = {}
  for (const key of logKeys) {
    const raw = values[key]
    if (!raw) continue
    try {
      logs[key.slice(LOG_PREFIX.length)] = JSON.parse(raw) as MonthLog
    } catch {
      // ignore corrupted entry
    }
  }
  return logs
}

export async function toggleCompletion(
  logs: LogsByMonth,
  habitId: string,
  date: Date,
): Promise<LogsByMonth> {
  const monthKey = toMonthKey(date)
  const day = toDayOfMonth(date)
  const monthLog: MonthLog = { ...(logs[monthKey] ?? {}) }
  const dayIds = monthLog[day] ?? []
  const isDone = dayIds.includes(habitId)
  monthLog[day] = isDone ? dayIds.filter((id) => id !== habitId) : [...dayIds, habitId]
  if (monthLog[day].length === 0) delete monthLog[day]

  await cloudSetItem(LOG_PREFIX + monthKey, JSON.stringify(monthLog))
  return { ...logs, [monthKey]: monthLog }
}

export async function deleteHabit(habits: Habit[], logs: LogsByMonth, habitId: string) {
  const nextHabits = habits.filter((h) => h.id !== habitId)
  await saveHabits(nextHabits)
  const nextLogs = await deleteHabitLogs(habitId, logs)
  return { habits: nextHabits, logs: nextLogs }
}
