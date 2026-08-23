import { useState } from 'react'
import type { Habit, LogsByMonth } from '../types/habit'
import { isHabitDoneForValue } from '../types/habit'
import { getBestStreak, getCurrentStreak, getHeatmapDays, getTotalCompletions, getWeeklyTotals } from '../lib/streaks'
import { today } from '../lib/date'
import HabitIcon from './HabitIcon'
import WeeklyChart from './WeeklyChart'

interface HabitDetailProps {
  habit: Habit
  logs: LogsByMonth
  todayValue: number
  todayMemo: string
  onLogToday: () => void
  onSaveMemo: (text: string) => void
  onDelete: () => void
}

export default function HabitDetail({ habit, logs, todayValue, todayMemo, onLogToday, onSaveMemo, onDelete }: HabitDetailProps) {
  const ref = today()
  const current = getCurrentStreak(logs, habit, ref)
  const best = getBestStreak(logs, habit)
  const total = getTotalCompletions(logs, habit)
  const heatmap = getHeatmapDays(logs, habit, ref, 18)
  const weeklyTotals = getWeeklyTotals(logs, habit, ref, 8)
  const doneToday = isHabitDoneForValue(habit, todayValue)
  const isQuit = habit.kind === 'quit'
  const [memo, setMemo] = useState(todayMemo)

  const primaryLabel =
    habit.type === 'goal' && habit.goal
      ? `${formatAmount(todayValue)}/${formatAmount(habit.goal.target)} ${habit.goal.unit}`
      : isQuit
        ? doneToday
          ? '✓ Без срывов сегодня'
          : 'Отметить срыв'
        : doneToday
          ? '✓ Выполнено сегодня'
          : 'Отметить сегодня'

  return (
    <div className="detail">
      <div className="detail-header">
        <div className="habit-emoji large" style={{ background: habit.color }}>
          <HabitIcon habit={habit} size={32} />
        </div>
        <h1>{habit.name}</h1>
        {habit.description && <p className="detail-description">{habit.description}</p>}
      </div>

      <button type="button" className="primary-btn" style={{ background: habit.color }} onClick={onLogToday}>
        {primaryLabel}
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

      <div className="field-label" style={{ marginTop: 24 }}>
        Активность за 8 недель
      </div>
      <div className="card-block">
        <WeeklyChart values={weeklyTotals} color={habit.color} type={habit.chartType ?? 'bar'} />
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

      {habit.showMemo && (
        <>
          <div className="field-label" style={{ marginTop: 24 }}>
            Заметка на сегодня
          </div>
          <textarea
            className="text-input memo-textarea"
            placeholder="Заметка (необязательно)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            onBlur={() => onSaveMemo(memo)}
            maxLength={280}
            rows={2}
          />
        </>
      )}

      <button type="button" className="danger-btn" onClick={onDelete}>
        Удалить привычку
      </button>
    </div>
  )
}

function formatAmount(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}
