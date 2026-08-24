import { cloudGetItems, cloudGetKeys, cloudRemoveItems, cloudSetItem } from './cloudStore'
import { toDayOfMonth, toMonthKey } from './date'
import type { DayLog, DayMemo, Habit, LogsByMonth, MemosByMonth, MonthLog, MonthMemo } from '../types/habit'

const HABITS_KEY = 'habits'
const LOG_PREFIX = 'logs_'
const MEMO_PREFIX = 'memos_'

/** Shape a habit may have been saved in before newer fields existed. */
interface StoredHabit extends Partial<Habit> {
  id: string
  name: string
  color: string
  createdAt: string
  emoji?: string
}

/** Fills in fields added after a habit may have been saved, so old records keep working. */
function normalizeHabit(raw: StoredHabit): Habit {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    iconType: raw.iconType ?? 'emoji',
    icon: raw.icon ?? raw.emoji ?? '⭐',
    color: raw.color,
    createdAt: raw.createdAt,
    kind: raw.kind ?? 'build',
    type: raw.type ?? 'boolean',
    goal: raw.goal,
    timeOfDay: raw.timeOfDay ?? 'anytime',
    activeWeekdays: raw.activeWeekdays ?? [0, 1, 2, 3, 4, 5, 6],
    startDate: raw.startDate ?? raw.createdAt.slice(0, 10),
    endDate: raw.endDate,
    group: raw.group,
    showMemo: raw.showMemo,
    chartType: raw.chartType,
    reminders: raw.reminders,
    reminderMessage: raw.reminderMessage,
  }
}

export async function loadHabits(): Promise<Habit[]> {
  const values = await cloudGetItems([HABITS_KEY])
  const raw = values[HABITS_KEY]
  if (!raw) return []
  try {
    return (JSON.parse(raw) as StoredHabit[]).map(normalizeHabit)
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

export function loadAllMemos(): Promise<MemosByMonth> {
  return loadPrefixedMonths<MonthMemo>(MEMO_PREFIX)
}

export async function setMemo(memos: MemosByMonth, habitId: string, date: Date, text: string): Promise<MemosByMonth> {
  const monthKey = toMonthKey(date)
  const day = toDayOfMonth(date)
  const monthMemo: MonthMemo = { ...(memos[monthKey] ?? {}) }
  const dayMemo: DayMemo = { ...(monthMemo[day] ?? {}) }
  if (text.trim()) dayMemo[habitId] = text.trim()
  else delete dayMemo[habitId]

  if (Object.keys(dayMemo).length > 0) monthMemo[day] = dayMemo
  else delete monthMemo[day]

  await cloudSetItem(MEMO_PREFIX + monthKey, JSON.stringify(monthMemo))
  return { ...memos, [monthKey]: monthMemo }
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

/** Removes `habitId`'s entry from every day of a month-keyed, per-habit record (logs or memos) and persists each changed month. */
async function deleteHabitFromRecord<T extends Record<string, unknown>>(
  prefix: string,
  habitId: string,
  data: Record<string, Record<string, T>>,
): Promise<Record<string, Record<string, T>>> {
  const next: Record<string, Record<string, T>> = {}
  const writes: Promise<void>[] = []
  for (const [monthKey, monthData] of Object.entries(data)) {
    const updated: Record<string, T> = {}
    for (const [day, dayData] of Object.entries(monthData)) {
      const filtered = { ...dayData }
      delete filtered[habitId]
      if (Object.keys(filtered).length > 0) updated[day] = filtered as T
    }
    next[monthKey] = updated
    writes.push(cloudSetItem(prefix + monthKey, JSON.stringify(updated)))
  }
  await Promise.all(writes)
  return next
}

export async function deleteHabit(habits: Habit[], logs: LogsByMonth, memos: MemosByMonth, habitId: string) {
  const nextHabits = habits.filter((h) => h.id !== habitId)
  await saveHabits(nextHabits)
  const nextLogs = await deleteHabitFromRecord<DayLog>(LOG_PREFIX, habitId, logs)
  const nextMemos = await deleteHabitFromRecord<DayMemo>(MEMO_PREFIX, habitId, memos)
  return { habits: nextHabits, logs: nextLogs, memos: nextMemos }
}

export async function wipeAllData() {
  const keys = await cloudGetKeys()
  await cloudRemoveItems(keys)
}
