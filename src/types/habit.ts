export type HabitType = 'boolean' | 'goal'
export type TimeOfDay = 'anytime' | 'morning' | 'afternoon' | 'evening'

export interface HabitGoal {
  target: number
  unit: string
}

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: string
  type: HabitType
  goal?: HabitGoal
  timeOfDay: TimeOfDay
}

/** habitId -> logged value for one day */
export type DayLog = Record<string, number>
/** dayOfMonth ("01".."31") -> DayLog, for one month */
export type MonthLog = Record<string, DayLog>
/** monthKey ("YYYY-MM") -> MonthLog */
export type LogsByMonth = Record<string, MonthLog>

/** monthKey ("YYYY-MM") -> dayOfMonth ("01".."31") -> mood emoji */
export type MonthMood = Record<string, string>
export type MoodByMonth = Record<string, MonthMood>

export function isHabitDoneForValue(habit: Habit, value: number) {
  if (habit.type === 'goal' && habit.goal) return value >= habit.goal.target
  return value > 0
}
