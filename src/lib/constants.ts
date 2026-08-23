import type { TimeOfDay } from '../types/habit'

export const HABIT_EMOJIS = [
  '💪', '🏃', '🧘', '📚', '💧', '🥗', '😴', '🚭',
  '💰', '✍️', '🎯', '🧹', '🎨', '🎵', '☀️', '🚴',
  '🧑‍💻', '❤️', '🦷', '🌱', '🧘‍♀️', '🍎', '🚶', '🎧',
]

/** Saturated colors used as full card backgrounds — stay readable with white text/icons. */
export const HABIT_COLORS = [
  '#FF5A5F', // coral red
  '#FF9142', // orange
  '#E0A800', // amber
  '#34C77B', // green
  '#4DD0C8', // teal
  '#4D96FF', // blue
  '#7B61FF', // purple
  '#FF6BA8', // pink
]

export const TIME_OF_DAY_OPTIONS: { value: TimeOfDay; label: string }[] = [
  { value: 'anytime', label: 'В любое время' },
  { value: 'morning', label: 'Утро' },
  { value: 'afternoon', label: 'День' },
  { value: 'evening', label: 'Вечер' },
]

export const MOOD_EMOJIS = ['😞', '🙁', '😐', '🙂', '😄']
