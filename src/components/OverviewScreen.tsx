import { useState } from 'react'
import type { Habit, LogsByMonth } from '../types/habit'
import { getMonthMatrix, isSameDay, monthLabel, today } from '../lib/date'
import {
  getBestStreakAcrossHabits,
  getDailyAverage,
  getHabitsDoneCount,
  getMonthlyRate,
  getPerfectDaysCount,
  getValue,
  habitsActiveOn,
  isDone,
} from '../lib/streaks'
import HabitIcon from './HabitIcon'

interface OverviewScreenProps {
  habits: Habit[]
  logs: LogsByMonth
  onAdd: () => void
}

export default function OverviewScreen({ habits, logs, onAdd }: OverviewScreenProps) {
  const [monthAnchor, setMonthAnchor] = useState(today())
  const [filterId, setFilterId] = useState<string>('all')

  const ref = today()
  const filtered = filterId === 'all' ? habits : habits.filter((h) => h.id === filterId)
  const isCurrentMonth = monthAnchor.getMonth() === ref.getMonth() && monthAnchor.getFullYear() === ref.getFullYear()
  const throughDate = isCurrentMonth ? ref : new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0)

  const rate = getMonthlyRate(logs, filtered, monthAnchor, throughDate)
  const bestStreak = getBestStreakAcrossHabits(logs, filtered)
  const perfectDays = getPerfectDaysCount(logs, filtered, monthAnchor, throughDate)
  const habitsDone = getHabitsDoneCount(logs, filtered, monthAnchor, throughDate)
  const dailyAverage = getDailyAverage(logs, filtered, monthAnchor, throughDate)

  const weeks = getMonthMatrix(monthAnchor)
  const doneToday = habitsActiveOn(filtered, ref).filter((h) => isDone(logs, h, ref))

  return (
    <div className="app">
      <div className="overview-header">
        <h1>Обзор</h1>
        <button type="button" className="fab-inline" onClick={onAdd} aria-label="Добавить привычку">
          +
        </button>
      </div>

      <div className="chip-row">
        <button
          type="button"
          className={`chip ${filterId === 'all' ? 'selected' : ''}`}
          onClick={() => setFilterId('all')}
        >
          Все
        </button>
        {habits.map((h) => (
          <button
            key={h.id}
            type="button"
            className={`chip ${filterId === h.id ? 'selected' : ''}`}
            style={filterId === h.id ? { background: h.color, color: '#fff' } : undefined}
            onClick={() => setFilterId(h.id)}
          >
            <HabitIcon habit={h} size={16} />
          </button>
        ))}
      </div>

      <div className="card-block">
        <div className="calendar-nav">
          <button type="button" className="icon-btn" onClick={() => setMonthAnchor((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}>
            ‹
          </button>
          <span className="calendar-title">
            {monthLabel(monthAnchor)} {monthAnchor.getFullYear()}
          </span>
          <button type="button" className="icon-btn" onClick={() => setMonthAnchor((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>
            ›
          </button>
        </div>
        <div className="calendar-grid">
          {weeks.map((week) =>
            week.map((date) => {
              const inMonth = date.getMonth() === monthAnchor.getMonth()
              const hasActivity = inMonth && date <= ref && habitsActiveOn(filtered, date).some((h) => isDone(logs, h, date))
              return (
                <div key={date.toISOString()} className={`calendar-cell ${inMonth ? '' : 'muted'} ${isSameDay(date, ref) ? 'today' : ''}`}>
                  <span>{date.getDate()}</span>
                  {hasActivity && <span className="calendar-dot" />}
                </div>
              )
            }),
          )}
        </div>
      </div>

      <div className="ring-block">
        <div className="ring" style={{ background: `conic-gradient(var(--brand) ${rate * 3.6}deg, var(--tg-secondary-bg) 0deg)` }}>
          <div className="ring-inner">
            <div className="ring-value">{rate}%</div>
            <div className="ring-label">За месяц</div>
          </div>
        </div>
      </div>

      <div className="stat-tiles">
        <div className="stat-tile">
          <div className="stat-tile-icon">🔥</div>
          <div className="stat-tile-value">{bestStreak}</div>
          <div className="stat-tile-label">Лучшая серия</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-icon">✅</div>
          <div className="stat-tile-value">{perfectDays}</div>
          <div className="stat-tile-label">Идеальных дней</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-icon">📈</div>
          <div className="stat-tile-value">{habitsDone}</div>
          <div className="stat-tile-label">Привычек выполнено</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-icon">📊</div>
          <div className="stat-tile-value">{dailyAverage}</div>
          <div className="stat-tile-label">В среднем за день</div>
        </div>
      </div>

      <div className="card-block">
        <div className="section-title">Сегодня выполнено</div>
        {doneToday.length === 0 ? (
          <div className="empty-hint">Пока ничего не отмечено</div>
        ) : (
          doneToday.map((h) => (
            <div key={h.id} className="done-today-row">
              <span className="done-today-name">
                <HabitIcon habit={h} size={16} /> {h.name}
              </span>
              {h.type === 'goal' && h.goal && (
                <span className="done-today-value">
                  {formatAmount(getValue(logs, h.id, ref))} {h.goal.unit}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function formatAmount(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}
