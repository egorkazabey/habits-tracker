import { addDays, toDayOfMonth, toMonthKey } from './date'
import type { LogsByMonth } from '../types/habit'

function isDone(logs: LogsByMonth, habitId: string, date: Date) {
  const monthLog = logs[toMonthKey(date)]
  const dayIds = monthLog?.[toDayOfMonth(date)]
  return dayIds?.includes(habitId) ?? false
}

export function getCurrentStreak(logs: LogsByMonth, habitId: string, referenceDate: Date) {
  let cursor = new Date(referenceDate)
  if (!isDone(logs, habitId, cursor)) {
    cursor = addDays(cursor, -1)
  }
  let streak = 0
  while (isDone(logs, habitId, cursor)) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function getBestStreak(logs: LogsByMonth, habitId: string) {
  const doneDates = new Set<string>()
  for (const [monthKey, monthLog] of Object.entries(logs)) {
    for (const [day, ids] of Object.entries(monthLog)) {
      if (ids.includes(habitId)) doneDates.add(`${monthKey}-${day}`)
    }
  }
  let best = 0
  for (const key of doneDates) {
    const [y, m, d] = key.split('-').map(Number)
    const prevKey = toDateKeyRaw(addDays(new Date(y, m - 1, d), -1))
    if (doneDates.has(prevKey)) continue
    let streak = 1
    let cursor = new Date(y, m - 1, d)
    while (doneDates.has(toDateKeyRaw(addDays(cursor, 1)))) {
      streak += 1
      cursor = addDays(cursor, 1)
    }
    best = Math.max(best, streak)
  }
  return best
}

function toDateKeyRaw(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function getTotalCompletions(logs: LogsByMonth, habitId: string) {
  let total = 0
  for (const monthLog of Object.values(logs)) {
    for (const ids of Object.values(monthLog)) {
      if (ids.includes(habitId)) total += 1
    }
  }
  return total
}

export function getHeatmapDays(logs: LogsByMonth, habitId: string, referenceDate: Date, weeks = 18) {
  const days: { date: Date; done: boolean }[] = []
  const end = new Date(referenceDate)
  const daysBack = weeks * 7 - 1
  for (let i = daysBack; i >= 0; i--) {
    const date = addDays(end, -i)
    days.push({ date, done: isDone(logs, habitId, date) })
  }
  return days
}
