import { addDays, getWeekDays, mondayIndex, parseDateKey, toDateKey, toDayOfMonth, toMonthKey, today } from './date'
import { isHabitDoneForValue } from '../types/habit'
import type { Habit, LogsByMonth } from '../types/habit'

export function getValue(logs: LogsByMonth, habitId: string, date: Date): number {
  return logs[toMonthKey(date)]?.[toDayOfMonth(date)]?.[habitId] ?? 0
}

export function isDone(logs: LogsByMonth, habit: Habit, date: Date) {
  return isHabitDoneForValue(habit, getValue(logs, habit.id, date))
}

function wasHabitActive(habit: Habit, date: Date) {
  const key = toDateKey(date)
  if (key < habit.startDate) return false
  if (habit.endDate && key > habit.endDate) return false
  return habit.activeWeekdays.includes(mondayIndex(date))
}

/** Backward scan from `referenceDate`, skipping non-scheduled days without breaking the streak. */
export function getCurrentStreak(logs: LogsByMonth, habit: Habit, referenceDate: Date) {
  let cursor = new Date(referenceDate)
  if (wasHabitActive(habit, cursor) && !isDone(logs, habit, cursor)) {
    cursor = addDays(cursor, -1)
  }
  let streak = 0
  while (toDateKey(cursor) >= habit.startDate) {
    if (!wasHabitActive(habit, cursor)) {
      cursor = addDays(cursor, -1)
      continue
    }
    if (!isDone(logs, habit, cursor)) break
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

/** Forward scan over the habit's whole scheduled lifetime, tracking the longest run of scheduled+done days. */
export function getBestStreak(logs: LogsByMonth, habit: Habit, referenceDate: Date = today()) {
  const endBound = habit.endDate && habit.endDate < toDateKey(referenceDate) ? parseDateKey(habit.endDate) : referenceDate
  let best = 0
  let current = 0
  let cursor = parseDateKey(habit.startDate)
  while (cursor <= endBound) {
    if (wasHabitActive(habit, cursor)) {
      if (isDone(logs, habit, cursor)) {
        current += 1
        best = Math.max(best, current)
      } else {
        current = 0
      }
    }
    cursor = addDays(cursor, 1)
  }
  return best
}

export function getTotalCompletions(logs: LogsByMonth, habit: Habit, referenceDate: Date = today()) {
  const endBound = habit.endDate && habit.endDate < toDateKey(referenceDate) ? parseDateKey(habit.endDate) : referenceDate
  let total = 0
  let cursor = parseDateKey(habit.startDate)
  while (cursor <= endBound) {
    if (wasHabitActive(habit, cursor) && isDone(logs, habit, cursor)) total += 1
    cursor = addDays(cursor, 1)
  }
  return total
}

export function getHeatmapDays(logs: LogsByMonth, habit: Habit, referenceDate: Date, weeks = 18) {
  const days: { date: Date; done: boolean }[] = []
  const end = new Date(referenceDate)
  const daysBack = weeks * 7 - 1
  for (let i = daysBack; i >= 0; i--) {
    const date = addDays(end, -i)
    days.push({ date, done: wasHabitActive(habit, date) && isDone(logs, habit, date) })
  }
  return days
}

/** Habits scheduled to run on `date`: within [startDate, endDate] and matching activeWeekdays. */
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

/** Completions per week (Mon-first) for the `weeks` weeks up to and including `referenceDate`'s week. */
export function getWeeklyTotals(logs: LogsByMonth, habit: Habit, referenceDate: Date, weeks = 8) {
  const totals: number[] = []
  for (let w = weeks - 1; w >= 0; w--) {
    const weekDays = getWeekDays(addDays(referenceDate, -w * 7))
    let count = 0
    for (const date of weekDays) {
      if (date > referenceDate) continue
      if (wasHabitActive(habit, date) && isDone(logs, habit, date)) count += 1
    }
    totals.push(count)
  }
  return totals
}

export function getBestStreakAcrossHabits(logs: LogsByMonth, habits: Habit[]) {
  let best = 0
  for (const habit of habits) {
    best = Math.max(best, getBestStreak(logs, habit))
  }
  return best
}
