export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: string
}

/** monthKey ("YYYY-MM") -> dayOfMonth ("01".."31") -> habit ids completed that day */
export type MonthLog = Record<string, string[]>
export type LogsByMonth = Record<string, MonthLog>
