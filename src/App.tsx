import { useEffect, useState } from 'react'
import HabitCard from './components/HabitCard'
import AddHabitSheet from './components/AddHabitSheet'
import HabitDetail from './components/HabitDetail'
import DayStrip from './components/DayStrip'
import FilterSheet from './components/FilterSheet'
import { STATUS_OPTIONS, TIME_OPTIONS } from './lib/filters'
import type { StatusFilter, TimeFilter } from './lib/filters'
import GoalLogSheet from './components/GoalLogSheet'
import MoodPicker from './components/MoodPicker'
import BottomNav from './components/BottomNav'
import type { Tab } from './components/BottomNav'
import OverviewScreen from './components/OverviewScreen'
import ReportScreen from './components/ReportScreen'
import SettingsScreen from './components/SettingsScreen'
import {
  getTelegramUser,
  haptic,
  hapticNotify,
  initTelegram,
  useBackButton,
  useTelegramThemeVars,
} from './lib/telegram'
import {
  loadAllLogs,
  loadAllMoods,
  loadHabits,
  saveHabits,
  setLogValue,
  setMood,
  toggleBooleanCompletion,
  deleteHabit as deleteHabitFromStore,
  wipeAllData,
} from './lib/storage'
import { today, toDayOfMonth, toMonthKey, timeBucketNow } from './lib/date'
import { getCurrentStreak, getValue } from './lib/streaks'
import { isHabitDoneForValue } from './types/habit'
import type { Habit, LogsByMonth, MoodByMonth, HabitType, TimeOfDay } from './types/habit'
import './App.css'

type View = { name: 'list' } | { name: 'detail'; habitId: string }

function App() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<LogsByMonth>({})
  const [moods, setMoods] = useState<MoodByMonth>({})
  const [loading, setLoading] = useState(true)

  const [tab, setTab] = useState<Tab>('home')
  const [view, setView] = useState<View>({ name: 'list' })
  const [selectedDate, setSelectedDate] = useState(today())

  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [showMoodPicker, setShowMoodPicker] = useState(false)
  const [goalHabitId, setGoalHabitId] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

  useTelegramThemeVars()

  useEffect(() => {
    initTelegram()
    Promise.all([loadHabits(), loadAllLogs(), loadAllMoods()])
      .then(([loadedHabits, loadedLogs, loadedMoods]) => {
        setHabits(loadedHabits)
        setLogs(loadedLogs)
        setMoods(loadedMoods)
      })
      .finally(() => setLoading(false))
  }, [])

  useBackButton(view.name === 'detail', () => setView({ name: 'list' }))

  const user = getTelegramUser()
  const ref = today()

  const applyLogs = (next: LogsByMonth) => setLogs(next)

  const handleToggleBoolean = async (habitId: string) => {
    haptic('medium')
    const next = await toggleBooleanCompletion(logs, habitId, selectedDate)
    applyLogs(next)
  }

  const handleSaveGoal = async (habitId: string, value: number) => {
    const next = await setLogValue(logs, habitId, selectedDate, value)
    applyLogs(next)
    setGoalHabitId(null)
    hapticNotify('success')
  }

  const handleAddHabit = async (data: {
    name: string
    emoji: string
    color: string
    type: HabitType
    goal?: { target: number; unit: string }
    timeOfDay: TimeOfDay
  }) => {
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: data.name,
      emoji: data.emoji,
      color: data.color,
      createdAt: new Date().toISOString(),
      type: data.type,
      goal: data.goal,
      timeOfDay: data.timeOfDay,
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

  const handleSetMood = async (date: Date, emoji: string) => {
    const next = await setMood(moods, date, emoji)
    setMoods(next)
    setShowMoodPicker(false)
    hapticSelectSafe()
  }

  const handleResetAll = async () => {
    if (!confirm('Удалить все привычки и всю историю без возможности восстановления?')) return
    await wipeAllData()
    setHabits([])
    setLogs({})
    setMoods({})
    setTab('home')
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

  if (tab === 'home' && view.name === 'detail') {
    const habit = habits.find((h) => h.id === view.habitId)
    if (!habit) {
      setView({ name: 'list' })
      return null
    }
    return (
      <HabitDetail
        habit={habit}
        logs={logs}
        todayValue={getValue(logs, habit.id, ref)}
        onLogToday={() => (habit.type === 'goal' ? setGoalHabitId(habit.id) : handleToggleTodayFromDetail(habit.id))}
        onDelete={() => handleDelete(habit.id)}
      />
    )
  }

  async function handleToggleTodayFromDetail(habitId: string) {
    haptic('medium')
    const next = await toggleBooleanCompletion(logs, habitId, ref)
    applyLogs(next)
  }

  const goalHabit = goalHabitId ? habits.find((h) => h.id === goalHabitId) : undefined
  const todayMood = moods[toMonthKey(ref)]?.[toDayOfMonth(ref)]

  const filteredHabits = habits.filter((habit) => {
    const value = getValue(logs, habit.id, selectedDate)
    if (statusFilter !== 'all') {
      const done = isHabitDoneForValue(habit, value)
      if (statusFilter === 'met' && !done) return false
      if (statusFilter === 'unmet' && done) return false
    }
    if (timeFilter !== 'all') {
      if (timeFilter === 'now') {
        const bucket = timeBucketNow()
        if (habit.timeOfDay !== 'anytime' && habit.timeOfDay !== bucket) return false
      } else if (habit.timeOfDay !== timeFilter) {
        return false
      }
    }
    return true
  })

  const filterLabel = buildFilterLabel(statusFilter, timeFilter)

  return (
    <>
      {tab === 'home' && (
        <div className="app">
          <header className="app-header">
            <div className="app-header-row">
              <button type="button" className="filter-pill" onClick={() => setShowFilterSheet(true)}>
                {filterLabel} ⌄
              </button>
              <h1>Привычки</h1>
              <button type="button" className="mood-avatar" onClick={() => setShowMoodPicker(true)} aria-label="Настроение">
                {todayMood ?? '🙂'}
              </button>
            </div>
            <p className="app-subtitle">
              {user?.first_name ? `Привет, ${user.first_name}!` : 'Отмечай прогресс каждый день'}
            </p>
          </header>

          <DayStrip selectedDate={selectedDate} today={ref} onSelect={setSelectedDate} />

          {habits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">🌱</div>
              <p>Пока нет привычек</p>
              <p className="empty-hint">Нажми «+», чтобы добавить первую</p>
            </div>
          ) : filteredHabits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">🔍</div>
              <p>Ничего не найдено под текущий фильтр</p>
            </div>
          ) : (
            <div className="habit-list">
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  value={getValue(logs, habit.id, selectedDate)}
                  streak={getCurrentStreak(logs, habit, ref)}
                  onToggle={() =>
                    habit.type === 'goal' ? setGoalHabitId(habit.id) : handleToggleBoolean(habit.id)
                  }
                  onOpen={() => setView({ name: 'detail', habitId: habit.id })}
                />
              ))}
            </div>
          )}

          <button type="button" className="fab" onClick={() => setShowAddSheet(true)} aria-label="Добавить привычку">
            +
          </button>
        </div>
      )}

      {tab === 'overview' && <OverviewScreen habits={habits} logs={logs} onAdd={() => setShowAddSheet(true)} />}

      {tab === 'report' && (
        <ReportScreen habits={habits} logs={logs} moods={moods} onSetMood={handleSetMood} onAdd={() => setShowAddSheet(true)} />
      )}

      {tab === 'settings' && <SettingsScreen onResetAll={handleResetAll} />}

      <BottomNav active={tab} onChange={(t) => { setTab(t); setView({ name: 'list' }) }} />

      {showAddSheet && <AddHabitSheet onSubmit={handleAddHabit} onClose={() => setShowAddSheet(false)} />}

      {showFilterSheet && (
        <FilterSheet
          status={statusFilter}
          time={timeFilter}
          onChangeStatus={setStatusFilter}
          onChangeTime={setTimeFilter}
          onClose={() => setShowFilterSheet(false)}
        />
      )}

      {goalHabit && (
        <GoalLogSheet
          habit={goalHabit}
          value={getValue(logs, goalHabit.id, tab === 'home' ? selectedDate : ref)}
          onSave={(value) => handleSaveGoal(goalHabit.id, value)}
          onClose={() => setGoalHabitId(null)}
        />
      )}

      {showMoodPicker && <MoodPicker onSelect={(emoji) => handleSetMood(ref, emoji)} onClose={() => setShowMoodPicker(false)} />}
    </>
  )
}

function buildFilterLabel(status: StatusFilter, time: TimeFilter) {
  if (status === 'all' && time === 'all') return 'Все'
  const parts: string[] = []
  if (status !== 'all') parts.push(STATUS_OPTIONS.find((o) => o.value === status)!.label)
  if (time !== 'all') parts.push(TIME_OPTIONS.find((o) => o.value === time)!.label)
  return parts.join(' · ')
}

function hapticSelectSafe() {
  haptic('light')
}

export default App
