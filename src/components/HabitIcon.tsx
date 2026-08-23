import { ICON_REGISTRY } from '../lib/iconRegistry'
import type { Habit } from '../types/habit'

interface HabitIconProps {
  habit: Pick<Habit, 'iconType' | 'icon'>
  size?: number
}

export default function HabitIcon({ habit, size = 22 }: HabitIconProps) {
  if (habit.iconType === 'icon') {
    const Icon = ICON_REGISTRY[habit.icon]
    if (Icon) return <Icon size={size} strokeWidth={2} />
  }
  return <span style={{ fontSize: size }}>{habit.icon}</span>
}
