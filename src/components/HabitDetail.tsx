import type { Habit, LogsByMonth } from '../types/habit'
import { getBestStreak, getCurrentStreak, getHeatmapDays, getTotalCompletions } from '../lib/streaks'
import { today } from '../lib/date'

interface HabitDetailProps {
  habit: Habit
  logs: LogsByMonth
  onToggleToday: () => void
  onDelete: () => void
  doneToday: boolean
}

export default function HabitDetail({ habit, logs, onToggleToday, onDelete, doneToday }: HabitDetailProps) {
  const ref = today()
  const current = getCurrentStreak(logs, habit.id, ref)
  const best = getBestStreak(logs, habit.id)
  const total = getTotalCompletions(logs, habit.id)
  const heatmap = getHeatmapDays(logs, habit.id, ref, 18)

  return (
    <div className="detail">
      <div className="detail-header">
        <div className="habit-emoji large" style={{ background: `${habit.color}26` }}>
          {habit.emoji}
        </div>
        <h1>{habit.name}</h1>
      </div>

      <button
        type="button"
        className="primary-btn"
        style={{ background: habit.color }}
        onClick={onToggleToday}
      >
        {doneToday ? '✓ Выполнено сегодня' : 'Отметить сегодня'}
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
