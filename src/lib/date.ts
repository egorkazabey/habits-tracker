const pad = (n: number) => String(n).padStart(2, '0')

export function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

export function toDayOfMonth(date: Date) {
  return pad(date.getDate())
}

export function toDateKey(date: Date) {
  return `${toMonthKey(date)}-${toDayOfMonth(date)}`
}

/** Parses a "YYYY-MM-DD" key as a local-time Date (avoids the UTC-parse pitfall of `new Date(str)`). */
export function parseDateKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function isSameDay(a: Date, b: Date) {
  return toDateKey(a) === toDateKey(b)
}

export function today() {
  return startOfDay(new Date())
}

/** Monday-first weekday index: Monday = 0 ... Sunday = 6 */
/** Monday-first weekday index for `date`: Monday = 0 ... Sunday = 6. */
export function mondayIndex(date: Date) {
  return (date.getDay() + 6) % 7
}

export function startOfWeek(date: Date) {
  return addDays(startOfDay(date), -mondayIndex(date))
}

/** The Mon..Sun week containing `date`. */
export function getWeekDays(date: Date) {
  const start = startOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/** Calendar grid for the month containing `date`: weeks of 7 days (Mon-first), padded with adjacent-month days. */
export function getMonthMatrix(date: Date) {
  const first = startOfMonth(date)
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  const gridStart = startOfWeek(first)
  const lastWeekStart = startOfWeek(last)
  const weeks: Date[][] = []
  let cursor = gridStart
  while (cursor <= lastWeekStart) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)))
    cursor = addDays(cursor, 7)
  }
  return weeks
}

/** Mon-first weeks (each an array of dates, may run into adjacent months at the edges) covering the month containing `date`. */
export function getWeeksOfMonth(date: Date) {
  return getMonthMatrix(date).filter((week) => week.some((d) => d.getMonth() === date.getMonth()))
}

export function getMonthsOfYear(year: number) {
  return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))
}

export function timeBucketNow(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
export function weekdayLabel(date: Date) {
  return WEEKDAY_LABELS[mondayIndex(date)]
}

const MONTH_LABELS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
export function monthLabel(date: Date) {
  return MONTH_LABELS[date.getMonth()]
}
export function monthLabelShort(date: Date) {
  return monthLabel(date).slice(0, 3)
}
