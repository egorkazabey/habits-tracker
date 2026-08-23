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
