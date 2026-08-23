import type { Habit, LogsByMonth } from '../types/habit'
import { isHabitDoneForValue } from '../types/habit'
import { getBestStreak, getCurrentStreak, getHeatmapDays, getTotalCompletions } from '../lib/streaks'
import { today } from '../lib/date'

interface HabitDetailProps {
  habit: Habit
  logs: LogsByMonth
  todayValue: number
  onLogToday: () => void
  onDelete: () => void
}

export default function HabitDetail({ habit, logs, todayValue, onLogToday, onDelete }: HabitDetailProps) {
  const ref = today()
  const current = getCurrentStreak(logs, habit, ref)
  const best = getBestStreak(logs, habit)
  const total = getTotalCompletions(logs, habit)
  const heatmap = getHeatmapDays(logs, habit, ref, 18)
  const doneToday = isHabitDoneForValue(habit, todayValue)

  return (
    <div className="detail">
      <div className="detail-header">
        <div className="habit-emoji large" style={{ background: habit.color }}>
          {habit.emoji}
        </div>
        <h1>{habit.name}</h1>
      </div>

      <button type="button" className="primary-btn" style={{ background: habit.color }} onClick={onLogToday}>
        {habit.type === 'goal' && habit.goal
          ? `${formatAmount(todayValue)}/${formatAmount(habit.goal.target)} ${habit.goal.unit}`
          : doneToday
            ? '✓ Выполнено сегодня'
            : 'Отметить сегодня'}
      </button>

      <div className="stats-row">
        <div className="stat">
          <div className="stat-value">{current}</div>
          <div className="stat-label">Текущая серия</div>
        </div>
        <div className="stat">
          <div className="stat-value">{best}</div>
          <div className="stat-label">Лучшая серия</div>
        </div>
        <div className="stat">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Всего</div>
        </div>
      </div>

      <div className="field-label">История</div>
      <div className="heatmap" style={{ gridTemplateRows: 'repeat(7, 1fr)' }}>
        {heatmap.map(({ date, done }) => (
          <div
            key={date.toISOString()}
            className="heatmap-cell"
            style={done ? { background: habit.color } : undefined}
            title={date.toLocaleDateString('ru-RU')}
          />
        ))}
      </div>

      <button type="button" className="danger-btn" onClick={onDelete}>
        Удалить привычку
      </button>
    </div>
  )
}

function formatAmount(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}
