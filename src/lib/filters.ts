import type { TimeOfDay } from '../types/habit'

export type StatusFilter = 'all' | 'unmet' | 'met'
export type TimeFilter = 'all' | 'now' | TimeOfDay

export const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'unmet', label: 'Не выполнено' },
  { value: 'met', label: 'Выполнено' },
]

export const TIME_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'now', label: 'Сейчас' },
  { value: 'anytime', label: 'В любое время' },
  { value: 'morning', label: 'Утро' },
  { value: 'afternoon', label: 'День' },
  { value: 'evening', label: 'Вечер' },
]
