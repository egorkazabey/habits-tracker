import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Habit, LogsByMonth, MoodByMonth } from '../types/habit'
import {
  addDays,
  getMonthsOfYear,
  getWeekDays,
  getWeeksOfMonth,
  monthLabelShort,
  toDayOfMonth,
  toMonthKey,
  today,
  weekdayLabel,
} from '../lib/date'
import { getBestStreakAcrossHabits, habitsActiveOn, isDone } from '../lib/streaks'
import { MOOD_EMOJIS } from '../lib/constants'
import HabitIcon from './HabitIcon'
import MoodIcon from './MoodIcon'

type ReportTab = 'weekly' | 'monthly' | 'yearly'

interface ReportScreenProps {
  habits: Habit[]
  logs: LogsByMonth
  moods: MoodByMonth
  onSetMood: (date: Date, emoji: string) => void
  onAdd: () => void
}

export default function ReportScreen({ habits, logs, moods, onSetMood, onAdd }: ReportScreenProps) {
  const [tab, setTab] = useState<ReportTab>('weekly')
  const [anchor, setAnchor] = useState(new Date())

  return (
    <div className="app">
      <div className="overview-header">
        <h1>Отчёт</h1>
        <button type="button" className="fab-inline" onClick={onAdd} aria-label="Добавить привычку">
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="segmented" style={{ marginBottom: 16 }}>
        {(['weekly', 'monthly', 'yearly'] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={`segmented-btn ${tab === t ? 'selected' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'weekly' ? 'Неделя' : t === 'monthly' ? 'Месяц' : 'Год'}
          </button>
        ))}
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">📋</div>
          <p>Пока нет привычек для отчёта</p>
        </div>
      ) : tab === 'weekly' ? (
        <WeeklyReport
          habits={habits}
          logs={logs}
          moods={moods}
          onSetMood={onSetMood}
          anchor={anchor}
          onNav={(dir) => setAnchor((a) => addDays(a, dir * 7))}
        />
      ) : tab === 'monthly' ? (
        <MonthlyReport habits={habits} logs={logs} anchor={anchor} onNav={(dir) => setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + dir, 1))} />
      ) : (
        <YearlyReport habits={habits} logs={logs} anchor={anchor} onNav={(dir) => setAnchor((a) => new Date(a.getFullYear() + dir, a.getMonth(), 1))} />
      )}
    </div>
  )
}

function ReportNav({ label, onNav }: { label: string; onNav: (dir: 1 | -1) => void }) {
  return (
    <div className="calendar-nav">
      <button type="button" className="icon-btn" onClick={() => onNav(-1)}>
        ‹
      </button>
      <span className="calendar-title">{label}</span>
      <button type="button" className="icon-btn" onClick={() => onNav(1)}>
        ›
      </button>
    </div>
  )
}

function ReportStatsRow({ metPercent, bestLabel, totalDone, bestStreak }: { metPercent: number; bestLabel: string; totalDone: number; bestStreak: number }) {
  return (
    <div className="report-stats-row">
      <div className="stat">
        <div className="stat-value">{metPercent}%</div>
        <div className="stat-label">Выполнено</div>
      </div>
      <div className="stat">
        <div className="stat-value">{bestLabel}</div>
        <div className="stat-label">Лучший период</div>
      </div>
      <div className="stat">
        <div className="stat-value">{totalDone}</div>
        <div className="stat-label">Всего отметок</div>
      </div>
      <div className="stat">
        <div className="stat-value">{bestStreak}</div>
        <div className="stat-label">Лучшая серия</div>
      </div>
    </div>
  )
}

function WeeklyReport({
  habits,
  logs,
  moods,
  onSetMood,
  anchor,
  onNav,
}: {
  habits: Habit[]
  logs: LogsByMonth
  moods: MoodByMonth
  onSetMood: (date: Date, emoji: string) => void
  anchor: Date
  onNav: (dir: 1 | -1) => void
}) {
  const ref = today()
  const days = getWeekDays(anchor)
  const first = days[0]
  const last = days[6]

  const perDay = days.map((date) => {
    const active = date <= ref ? habitsActiveOn(habits, date) : []
    const done = active.filter((h) => isDone(logs, h, date)).length
    return { done, possible: active.length }
  })
  const totalDone = perDay.reduce((sum, d) => sum + d.done, 0)
  const totalPossible = perDay.reduce((sum, d) => sum + d.possible, 0)
  const perDayDone = perDay.map((d) => d.done)
  const bestDayIndex = perDayDone.indexOf(Math.max(...perDayDone))

  return (
    <>
      <div className="card-block">
        <ReportNav label={`${formatShort(first)} – ${formatShort(last)}`} onNav={onNav} />
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th className="report-habit-col" />
                {days.map((d) => (
                  <th key={d.toISOString()}>{weekdayLabel(d)}</th>
                ))}
                <th>🏅</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => {
                const active = days.filter((d) => d <= ref && habitsActiveOn([habit], d).length > 0)
                const doneCount = active.filter((d) => isDone(logs, habit, d)).length
                const perfect = active.length > 0 && doneCount === active.length
                return (
                  <tr key={habit.id}>
                    <td className="report-habit-col">
                      <HabitIcon habit={habit} size={14} /> {habit.name}
                    </td>
                    {days.map((d) => {
                      const isActive = d <= ref && habitsActiveOn([habit], d).length > 0
                      const cellDone = isActive && isDone(logs, habit, d)
                      return (
                        <td key={d.toISOString()}>
                          <span
                            className="report-cell"
                            style={cellDone ? { background: habit.color } : undefined}
                          />
                        </td>
                      )
                    })}
                    <td>{perfect ? <span className="perfect-badge">✓</span> : null}</td>
                  </tr>
                )
              })}
              <tr>
                <td className="report-habit-col">Настроение</td>
                {days.map((d) => {
                  const monthKey = toMonthKey(d)
                  const day = toDayOfMonth(d)
                  const current = moods[monthKey]?.[day]
                  return (
                    <td key={d.toISOString()}>
                      <button
                        type="button"
                        className="mood-cell"
                        onClick={() => {
                          const idx = current ? MOOD_EMOJIS.indexOf(current) : -1
                          onSetMood(d, MOOD_EMOJIS[(idx + 1) % MOOD_EMOJIS.length])
                        }}
                      >
                        {current ? <MoodIcon mood={current} size={14} /> : '·'}
                      </button>
                    </td>
                  )
                })}
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ReportStatsRow
        metPercent={totalPossible === 0 ? 0 : Math.round((totalDone / totalPossible) * 100)}
        bestLabel={weekdayLabel(days[bestDayIndex])}
        totalDone={totalDone}
        bestStreak={getBestStreakAcrossHabits(logs, habits)}
      />
    </>
  )
}

function MonthlyReport({ habits, logs, anchor, onNav }: { habits: Habit[]; logs: LogsByMonth; anchor: Date; onNav: (dir: 1 | -1) => void }) {
  const ref = today()
  const weeks = getWeeksOfMonth(anchor)

  const perWeek = weeks.map((week) => {
    let done = 0
    let possible = 0
    for (const habit of habits) {
      for (const date of week) {
        if (date > ref || habitsActiveOn([habit], date).length === 0) continue
        possible += 1
        if (isDone(logs, habit, date)) done += 1
      }
    }
    return { done, possible }
  })
  const totalDone = perWeek.reduce((sum, w) => sum + w.done, 0)
  const totalPossible = perWeek.reduce((sum, w) => sum + w.possible, 0)
  const perWeekDone = perWeek.map((w) => w.done)
  const bestWeekIndex = perWeekDone.indexOf(Math.max(...perWeekDone))

  return (
    <>
      <div className="card-block">
        <ReportNav label={`${monthLabelShort(anchor)} ${anchor.getFullYear()}`} onNav={onNav} />
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th className="report-habit-col" />
                {weeks.map((_, i) => (
                  <th key={i}>Н{i + 1}</th>
                ))}
                <th>🏅</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => {
                let perfectWeeks = 0
                const cells = weeks.map((week) => {
                  const activeDays = week.filter((d) => d <= ref && habitsActiveOn([habit], d).length > 0)
                  const doneDays = activeDays.filter((d) => isDone(logs, habit, d)).length
                  const isPerfect = activeDays.length > 0 && doneDays === activeDays.length
                  if (isPerfect) perfectWeeks += 1
                  return { doneDays, activeDays: activeDays.length, isPerfect }
                })
                return (
                  <tr key={habit.id}>
                    <td className="report-habit-col">
                      <HabitIcon habit={habit} size={14} /> {habit.name}
                    </td>
                    {cells.map((cell, i) => (
                      <td key={i}>
                        <span
                          className="report-fraction"
                          style={cell.isPerfect ? { background: habit.color, color: '#fff' } : undefined}
                        >
                          {cell.activeDays > 0 ? `${cell.doneDays}/${cell.activeDays}` : '–'}
                        </span>
                      </td>
                    ))}
                    <td>
                      <span className="perfect-badge">{perfectWeeks}/{weeks.length}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ReportStatsRow
        metPercent={totalPossible === 0 ? 0 : Math.round((totalDone / totalPossible) * 100)}
        bestLabel={`Неделя ${bestWeekIndex + 1}`}
        totalDone={totalDone}
        bestStreak={getBestStreakAcrossHabits(logs, habits)}
      />
    </>
  )
}

function YearlyReport({ habits, logs, anchor, onNav }: { habits: Habit[]; logs: LogsByMonth; anchor: Date; onNav: (dir: 1 | -1) => void }) {
  const ref = today()
  const months = getMonthsOfYear(anchor.getFullYear())

  const perMonth = months.map((monthStart) => {
    const lastDay = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
    let done = 0
    let possible = 0
    for (const habit of habits) {
      for (let d = 1; d <= lastDay; d++) {
        const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), d)
        if (date > ref || habitsActiveOn([habit], date).length === 0) continue
        possible += 1
        if (isDone(logs, habit, date)) done += 1
      }
    }
    return { done, possible }
  })
  const totalDone = perMonth.reduce((sum, m) => sum + m.done, 0)
  const totalPossible = perMonth.reduce((sum, m) => sum + m.possible, 0)
  const perMonthDone = perMonth.map((m) => m.done)
  const bestMonthIndex = perMonthDone.indexOf(Math.max(...perMonthDone))

  return (
    <>
      <div className="card-block">
        <ReportNav label={`${anchor.getFullYear()}`} onNav={onNav} />
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th className="report-habit-col" />
                {months.map((m) => (
                  <th key={m.toISOString()}>{monthLabelShort(m)}</th>
                ))}
                <th>🏅</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => {
                let perfectMonths = 0
                const cells = months.map((monthStart) => {
                  const lastDay = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
                  let done = 0
                  let active = 0
                  for (let d = 1; d <= lastDay; d++) {
                    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), d)
                    if (date > ref || habitsActiveOn([habit], date).length === 0) continue
                    active += 1
                    if (isDone(logs, habit, date)) done += 1
                  }
                  const pct = active > 0 ? Math.round((done / active) * 100) : 0
                  const isPerfect = active > 0 && done === active
                  if (isPerfect) perfectMonths += 1
                  return { pct, active, isPerfect }
                })
                return (
                  <tr key={habit.id}>
                    <td className="report-habit-col">
                      <HabitIcon habit={habit} size={14} /> {habit.name}
                    </td>
                    {cells.map((cell, i) => (
                      <td key={i}>
                        <span
                          className="report-fraction"
                          style={cell.isPerfect ? { background: habit.color, color: '#fff' } : undefined}
                        >
                          {cell.active > 0 ? `${cell.pct}%` : '–'}
                        </span>
                      </td>
                    ))}
                    <td>
                      <span className="perfect-badge">{perfectMonths}/12</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ReportStatsRow
        metPercent={totalPossible === 0 ? 0 : Math.round((totalDone / totalPossible) * 100)}
        bestLabel={monthLabelShort(months[bestMonthIndex])}
        totalDone={totalDone}
        bestStreak={getBestStreakAcrossHabits(logs, habits)}
      />
    </>
  )
}

function formatShort(date: Date) {
  return `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}`
}
