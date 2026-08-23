import { addDays, toDateKey, toDayOfMonth, toMonthKey } from './date'
import { isHabitDoneForValue } from '../types/habit'
import type { Habit, LogsByMonth } from '../types/habit'

export function getValue(logs: LogsByMonth, habitId: string, date: Date): number {
  return logs[toMonthKey(date)]?.[toDayOfMonth(date)]?.[habitId] ?? 0
}

export function isDone(logs: LogsByMonth, habit: Habit, date: Date) {
  return isHabitDoneForValue(habit, getValue(logs, habit.id, date))
}

function wasHabitActive(habit: Habit, date: Date) {
  return toDateKey(new Date(habit.createdAt)) <= toDateKey(date)
}

export function getCurrentStreak(logs: LogsByMonth, habit: Habit, referenceDate: Date) {
  let cursor = new Date(referenceDate)
  if (!isDone(logs, habit, cursor)) {
    cursor = addDays(cursor, -1)
  }
  let streak = 0
  while (wasHabitActive(habit, cursor) && isDone(logs, habit, cursor)) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function getBestStreak(logs: LogsByMonth, habit: Habit) {
  const doneDates = new Set<string>()
  for (const [monthKey, monthLog] of Object.entries(logs)) {
    for (const [day, dayLog] of Object.entries(monthLog)) {
      const value = dayLog[habit.id]
      if (value !== undefined && isHabitDoneForValue(habit, value)) doneDates.add(`${monthKey}-${day}`)
    }
  }
  let best = 0
  for (const key of doneDates) {
    const [y, m, d] = key.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    const prevKey = toDateKey(addDays(date, -1))
    if (doneDates.has(prevKey)) continue
    let streak = 1
    let cursor = date
    while (doneDates.has(toDateKey(addDays(cursor, 1)))) {
      streak += 1
      cursor = addDays(cursor, 1)
    }
    best = Math.max(best, streak)
  }
  return best
}

export function getTotalCompletions(logs: LogsByMonth, habit: Habit) {
  let total = 0
  for (const monthLog of Object.values(logs)) {
    for (const dayLog of Object.values(monthLog)) {
      const value = dayLog[habit.id]
      if (value !== undefined && isHabitDoneForValue(habit, value)) total += 1
    }
  }
  return total
}

export function getHeatmapDays(logs: LogsByMonth, habit: Habit, referenceDate: Date, weeks = 18) {
  const days: { date: Date; done: boolean }[] = []
  const end = new Date(referenceDate)
  const daysBack = weeks * 7 - 1
  for (let i = daysBack; i >= 0; i--) {
    const date = addDays(end, -i)
    days.push({ date, done: isDone(logs, habit, date) })
  }
  return days
}

/** Habits that existed on `date` (i.e. created on or before it). */
export function habitsActiveOn(habits: Habit[], date: Date) {
  return habits.filter((h) => wasHabitActive(h, date))
}

export function isPerfectDay(logs: LogsByMonth, habits: Habit[], date: Date) {
  const active = habitsActiveOn(habits, date)
  if (active.length === 0) return false
  return active.every((h) => isDone(logs, h, date))
}

export function getMonthlyRate(logs: LogsByMonth, habits: Habit[], monthAnchor: Date, throughDate: Date) {
  const year = monthAnchor.getFullYear()
  const month = monthAnchor.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  let possible = 0
  let done = 0
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month, d)
    if (date > throughDate) break
    for (const habit of habitsActiveOn(habits, date)) {
      possible += 1
      if (isDone(logs, habit, date)) done += 1
    }
  }
  return possible === 0 ? 0 : Math.round((done / possible) * 100)
}

export function getPerfectDaysCount(logs: LogsByMonth, habits: Habit[], monthAnchor: Date, throughDate: Date) {
  const year = monthAnchor.getFullYear()
  const month = monthAnchor.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  let count = 0
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month, d)
    if (date > throughDate) break
    if (isPerfectDay(logs, habits, date)) count += 1
  }
  return count
}

export function getHabitsDoneCount(logs: LogsByMonth, habits: Habit[], monthAnchor: Date, throughDate: Date) {
  const year = monthAnchor.getFullYear()
  const month = monthAnchor.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  let count = 0
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month, d)
    if (date > throughDate) break
    for (const habit of habitsActiveOn(habits, date)) {
      if (isDone(logs, habit, date)) count += 1
    }
  }
  return count
}

export function getDailyAverage(logs: LogsByMonth, habits: Habit[], monthAnchor: Date, throughDate: Date) {
  const year = monthAnchor.getFullYear()
  const month = monthAnchor.getMonth()
  const daysElapsed = monthAnchor.getMonth() === throughDate.getMonth() && monthAnchor.getFullYear() === throughDate.getFullYear()
    ? throughDate.getDate()
    : new Date(year, month + 1, 0).getDate()
  const done = getHabitsDoneCount(logs, habits, monthAnchor, throughDate)
  return daysElapsed === 0 ? 0 : Math.round((done / daysElapsed) * 10) / 10
}

export function getBestStreakAcrossHabits(logs: LogsByMonth, habits: Habit[]) {
  let best = 0
  for (const habit of habits) {
    best = Math.max(best, getBestStreak(logs, habit))
  }
  return best
}
