export type HabitType = 'boolean' | 'goal'
export type HabitKind = 'build' | 'quit'
export type TimeOfDay = 'anytime' | 'morning' | 'afternoon' | 'evening'
export type IconType = 'emoji' | 'icon'
export type ChartType = 'bar' | 'line'

export interface HabitGoal {
  target: number
  unit: string
}

export interface HabitReminder {
  time: string // "HH:MM", local time
}

export interface Habit {
  id: string
  name: string
  description?: string
  iconType: IconType
  icon: string // emoji character, or a lucide-react icon name
  color: string
  createdAt: string
  kind: HabitKind
  type: HabitType
  goal?: HabitGoal
  timeOfDay: TimeOfDay
  activeWeekdays: number[] // 0=Mon .. 6=Sun
  startDate: string // ISO date, drives "was this habit active on date X"
  endDate?: string // ISO date, optional
  group?: string
  showMemo?: boolean
  chartType?: ChartType
  reminders?: HabitReminder[]
  reminderMessage?: string
}

/** habitId -> logged value for one day */
export type DayLog = Record<string, number>
/** dayOfMonth ("01".."31") -> DayLog, for one month */
export type MonthLog = Record<string, DayLog>
/** monthKey ("YYYY-MM") -> MonthLog */
export type LogsByMonth = Record<string, MonthLog>

/** habitId -> memo text for one day */
export type DayMemo = Record<string, string>
/** dayOfMonth ("01".."31") -> DayMemo, for one month */
export type MonthMemo = Record<string, DayMemo>
/** monthKey ("YYYY-MM") -> MonthMemo */
export type MemosByMonth = Record<string, MonthMemo>

export function isHabitDoneForValue(habit: Habit, value: number) {
  if (habit.kind === 'quit') return value === 0
  if (habit.type === 'goal' && habit.goal) return value >= habit.goal.target
  return value > 0
}
