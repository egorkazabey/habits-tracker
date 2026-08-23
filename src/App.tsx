import { useEffect, useState } from 'react'
import HabitCard from './components/HabitCard'
import AddHabitSheet from './components/AddHabitSheet'
import HabitDetail from './components/HabitDetail'
import {
  getTelegramUser,
  haptic,
  hapticNotify,
  initTelegram,
  useBackButton,
  useTelegramThemeVars,
} from './lib/telegram'
import { loadAllLogs, loadHabits, saveHabits, toggleCompletion, deleteHabit as deleteHabitFromStore } from './lib/storage'
import { today, toDayOfMonth, toMonthKey } from './lib/date'
import { getCurrentStreak } from './lib/streaks'
import type { Habit, LogsByMonth } from './types/habit'
import './App.css'

type View = { name: 'list' } | { name: 'detail'; habitId: string }

function App() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<LogsByMonth>({})
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>({ name: 'list' })
  const [showAddSheet, setShowAddSheet] = useState(false)

  useTelegramThemeVars()

  useEffect(() => {
    initTelegram()
    Promise.all([loadHabits(), loadAllLogs()])
      .then(([loadedHabits, loadedLogs]) => {
        setHabits(loadedHabits)
        setLogs(loadedLogs)
      })
      .finally(() => setLoading(false))
  }, [])

  useBackButton(view.name === 'detail', () => setView({ name: 'list' }))

  const user = getTelegramUser()
  const ref = today()
  const monthKey = toMonthKey(ref)
  const day = toDayOfMonth(ref)
  const doneTodayIds = new Set(logs[monthKey]?.[day] ?? [])

  const handleToggle = async (habitId: string) => {
    haptic('medium')
    const next = await toggleCompletion(logs, habitId, ref)
    setLogs(next)
  }

  const handleAddHabit = async (data: { name: string; emoji: string; color: string }) => {
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: data.name,
      emoji: data.emoji,
      color: data.color,
      createdAt: new Date().toISOString(),
    }
    const next = [habit, ...habits]
    setHabits(next)
    await saveHabits(next)
    setShowAddSheet(false)
    hapticNotify('success')
  }

  const handleDelete = async (habitId: string) => {
    if (!confirm('Удалить эту привычку вместе со всей историей?')) return
    const result = await deleteHabitFromStore(habits, logs, habitId)
    setHabits(result.habits)
    setLogs(result.logs)
    setView({ name: 'list' })
    hapticNotify('warning')
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    )
  }

  if (view.name === 'detail') {
    const habit = habits.find((h) => h.id === view.habitId)
    if (!habit) {
      setView({ name: 'list' })
      return null
    }
    return (
      <HabitDetail
        habit={habit}
        logs={logs}
        doneToday={doneTodayIds.has(habit.id)}
        onToggleToday={() => handleToggle(habit.id)}
        onDelete={() => handleDelete(habit.id)}
      />
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Привычки</h1>
        <p className="app-subtitle">
          {user?.first_name ? `Привет, ${user.first_name}!` : 'Отмечай прогресс каждый день'}
        </p>
      </header>

      {habits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">🌱</div>
          <p>Пока нет привычек</p>
          <p className="empty-hint">Нажми «+», чтобы добавить первую</p>
        </div>
      ) : (
        <div className="habit-list">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              name={habit.name}
              emoji={habit.emoji}
              color={habit.color}
              done={doneTodayIds.has(habit.id)}
              streak={getCurrentStreak(logs, habit.id, ref)}
              onToggle={() => handleToggle(habit.id)}
              onOpen={() => setView({ name: 'detail', habitId: habit.id })}
            />
          ))}
        </div>
      )}

      <button type="button" className="fab" onClick={() => setShowAddSheet(true)} aria-label="Добавить привычку">
        +
      </button>

      {showAddSheet && <AddHabitSheet onSubmit={handleAddHabit} onClose={() => setShowAddSheet(false)} />}
    </div>
  )
}

export default App
