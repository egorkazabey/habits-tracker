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

export const WEEKDAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export type IconCategory = 'sports' | 'food' | 'life' | 'other'

/** lucide-react icon component names, curated per category. */
export const HABIT_ICON_CATEGORIES: Record<IconCategory, { key: IconCategory; label: string; icons: string[] }> = {
  sports: {
    key: 'sports',
    label: 'Спорт',
    icons: [
      'Dumbbell', 'Bike', 'Waves', 'Footprints', 'Trophy', 'Target',
      'PersonStanding', 'Mountain', 'Volleyball', 'Timer', 'Flame', 'Snowflake',
    ],
  },
  food: {
    key: 'food',
    label: 'Еда',
    icons: [
      'Apple', 'Coffee', 'UtensilsCrossed', 'GlassWater', 'Salad', 'Carrot',
      'Egg', 'Fish', 'Cookie', 'Milk', 'Soup', 'IceCreamCone',
    ],
  },
  life: {
    key: 'life',
    label: 'Жизнь',
    icons: [
      'BookOpen', 'PenLine', 'Brain', 'Moon', 'Sun', 'Heart',
      'Wallet', 'Brush', 'Guitar', 'Camera', 'Bed', 'ShowerHead',
    ],
  },
  other: {
    key: 'other',
    label: 'Другое',
    icons: [
      'Star', 'CheckCircle', 'Smile', 'Sparkles', 'Leaf', 'Cigarette',
      'Ban', 'ThumbsUp', 'AlarmClock', 'Calendar', 'MapPin', 'Plane',
    ],
  },
}
