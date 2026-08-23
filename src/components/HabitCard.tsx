import type { Habit } from '../types/habit'
import { isHabitDoneForValue } from '../types/habit'
import HabitIcon from './HabitIcon'

interface HabitCardProps {
  habit: Habit
  value: number
  streak: number
  onToggle: () => void
  onOpen: () => void
}

export default function HabitCard({ habit, value, streak, onToggle, onOpen }: HabitCardProps) {
  const done = isHabitDoneForValue(habit, value)
  const isQuit = habit.kind === 'quit'

  return (
    <div className="habit-card" style={{ background: habit.color }} onClick={onOpen}>
      <div className="habit-emoji">
        <HabitIcon habit={habit} />
      </div>
      <div className="habit-info">
        <div className="habit-name">{habit.name}</div>
        <div className="habit-streak">
          {streak > 0 ? `🔥 ${streak} ${dayWord(streak)}${isQuit ? ' без срывов' : ''}` : 'Начни сегодня'}
        </div>
      </div>

      {habit.type === 'goal' && habit.goal ? (
        <button
          type="button"
          className={`habit-goal-value ${done ? 'done' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
        >
          {formatAmount(value)}/{formatAmount(habit.goal.target)}
          <span className="habit-goal-unit">{habit.goal.unit}</span>
        </button>
      ) : (
        <button
          type="button"
          className={`habit-check ${done ? 'done' : ''}`}
          style={done ? { background: '#fff', color: habit.color } : undefined}
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          aria-label={isQuit ? (done ? 'Отметить срыв' : 'Отменить срыв') : done ? 'Отметить как не выполнено' : 'Отметить как выполнено'}
        >
          {done ? '✓' : ''}
        </button>
      )}
    </div>
  )
}

function formatAmount(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function dayWord(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'дня'
  return 'дней'
}
