import { useState } from 'react'
import { HABIT_COLORS, TIME_OF_DAY_OPTIONS, WEEKDAY_SHORT } from '../lib/constants'
import { toDateKey } from '../lib/date'
import { isReminderBackendConfigured } from '../lib/reminders'
import IconPickerSheet from './IconPickerSheet'
import HabitIcon from './HabitIcon'
import type { Habit, HabitKind, HabitType, IconType, ChartType, TimeOfDay } from '../types/habit'

type NewHabit = Omit<Habit, 'id' | 'createdAt'>

interface AddHabitSheetProps {
  existingGroups: string[]
  initialHabit?: Habit
  onSubmit: (data: NewHabit) => void
  onClose: () => void
}

const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]

export default function AddHabitSheet({ existingGroups, initialHabit, onSubmit, onClose }: AddHabitSheetProps) {
  const isEditing = Boolean(initialHabit)

  const [name, setName] = useState(initialHabit?.name ?? '')
  const [description, setDescription] = useState(initialHabit?.description ?? '')
  const [color, setColor] = useState(initialHabit?.color ?? HABIT_COLORS[0])
  const [group, setGroup] = useState(initialHabit?.group ?? '')
  const [iconType, setIconType] = useState<IconType>(initialHabit?.iconType ?? 'emoji')
  const [icon, setIcon] = useState(initialHabit?.icon ?? '💪')
  const [showIconPicker, setShowIconPicker] = useState(false)

  const [kind, setKind] = useState<HabitKind>(initialHabit?.kind ?? 'build')
  const [type, setType] = useState<HabitType>(initialHabit?.type ?? 'boolean')
  const [target, setTarget] = useState(initialHabit?.goal?.target ?? 1)
  const [unit, setUnit] = useState(initialHabit?.goal?.unit ?? 'раз')

  const [everyDay, setEveryDay] = useState(!initialHabit || initialHabit.activeWeekdays.length === 7)
  const [activeWeekdays, setActiveWeekdays] = useState<number[]>(
    initialHabit && initialHabit.activeWeekdays.length !== 7 ? initialHabit.activeWeekdays : [],
  )

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(initialHabit?.timeOfDay ?? 'anytime')

  const [remindersOn, setRemindersOn] = useState(Boolean(initialHabit?.reminders?.length))
  const [reminderTimes, setReminderTimes] = useState<string[]>(initialHabit?.reminders?.map((r) => r.time) ?? [])
  const [newReminderTime, setNewReminderTime] = useState('09:00')
  const [reminderMessage, setReminderMessage] = useState(initialHabit?.reminderMessage ?? '')

  const [showMemo, setShowMemo] = useState(initialHabit?.showMemo ?? true)
  const [chartType, setChartType] = useState<ChartType>(initialHabit?.chartType ?? 'bar')

  const [startDate, setStartDate] = useState(initialHabit?.startDate ?? toDateKey(new Date()))
  const [endDate, setEndDate] = useState(initialHabit?.endDate ?? '')

  const canSubmit =
    name.trim().length > 0 &&
    (kind === 'quit' || type === 'boolean' || (target > 0 && unit.trim().length > 0)) &&
    (everyDay || activeWeekdays.length > 0)

  const toggleWeekday = (day: number) => {
    setActiveWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()))
  }

  const addReminderTime = () => {
    if (reminderTimes.includes(newReminderTime)) return
    setReminderTimes((prev) => [...prev, newReminderTime].sort())
  }

  const submit = () => {
    if (!canSubmit) return
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      iconType,
      icon,
      color,
      kind,
      type: kind === 'quit' ? 'boolean' : type,
      goal: kind === 'build' && type === 'goal' ? { target, unit: unit.trim() } : undefined,
      timeOfDay,
      activeWeekdays: everyDay ? ALL_WEEKDAYS : activeWeekdays,
      startDate,
      endDate: endDate || undefined,
      group: group.trim() || undefined,
      showMemo,
      chartType,
      reminders: remindersOn && reminderTimes.length > 0 ? reminderTimes.map((time) => ({ time })) : undefined,
      reminderMessage: reminderMessage.trim() || undefined,
    })
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>{isEditing ? 'Изменить привычку' : 'Новая привычка'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className="add-habit-top">
          <button type="button" className="icon-preview-btn" onClick={() => setShowIconPicker(true)}>
            <HabitIcon habit={{ iconType, icon }} size={28} />
          </button>
          <div className="add-habit-top-fields">
            <input
              className="text-input"
              style={{ marginBottom: 8 }}
              placeholder="Название"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={40}
            />
            <input
              className="text-input"
              style={{ marginBottom: 0 }}
              placeholder="Описание (необязательно)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={80}
            />
          </div>
        </div>

        <div className="field-label">Цвет</div>
        <div className="color-grid">
          {HABIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-btn ${c === color ? 'selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={c}
            />
          ))}
        </div>

        <div className="field-label">Группа</div>
        <input
          className="text-input"
          list="habit-groups"
          placeholder="Например: Здоровье (необязательно)"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          maxLength={30}
        />
        <datalist id="habit-groups">
          {existingGroups.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>

        <div className="field-label">Тип привычки</div>
        <div className="segmented" style={{ marginBottom: 16 }}>
          <button type="button" className={`segmented-btn ${kind === 'build' ? 'selected' : ''}`} onClick={() => setKind('build')}>
            Строить
          </button>
          <button type="button" className={`segmented-btn ${kind === 'quit' ? 'selected' : ''}`} onClick={() => setKind('quit')}>
            Бросить
          </button>
        </div>

        {kind === 'build' && (
          <>
            <div className="field-label">Как отмечать</div>
            <div className="segmented" style={{ marginBottom: 16 }}>
              <button type="button" className={`segmented-btn ${type === 'boolean' ? 'selected' : ''}`} onClick={() => setType('boolean')}>
                Да / нет
              </button>
              <button type="button" className={`segmented-btn ${type === 'goal' ? 'selected' : ''}`} onClick={() => setType('goal')}>
                Цель
              </button>
            </div>

            {type === 'goal' && (
              <div className="goal-inputs">
                <input
                  className="text-input goal-target-input"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value) || 0)}
                  placeholder="Цель"
                />
                <input
                  className="text-input goal-unit-input"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="ед. (ч, мл, раз…)"
                  maxLength={12}
                />
              </div>
            )}
          </>
        )}

        <div className="field-label">Дни</div>
        <div className="segmented" style={{ marginBottom: 12 }}>
          <button type="button" className={`segmented-btn ${everyDay ? 'selected' : ''}`} onClick={() => setEveryDay(true)}>
            Каждый день
          </button>
          <button type="button" className={`segmented-btn ${!everyDay ? 'selected' : ''}`} onClick={() => setEveryDay(false)}>
            Выбрать дни
          </button>
        </div>
        {!everyDay && (
          <div className="weekday-row">
            {WEEKDAY_SHORT.map((label, i) => (
              <button
                key={label}
                type="button"
                className={`weekday-btn ${activeWeekdays.includes(i) ? 'selected' : ''}`}
                onClick={() => toggleWeekday(i)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="field-label" style={{ marginTop: 16 }}>
          Время суток
        </div>
        <div className="segmented wrap" style={{ marginBottom: 20 }}>
          {TIME_OF_DAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`segmented-btn ${timeOfDay === opt.value ? 'selected' : ''}`}
              onClick={() => setTimeOfDay(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="toggle-row">
          <span>Напоминания</span>
          <label className="switch">
            <input type="checkbox" checked={remindersOn} onChange={(e) => setRemindersOn(e.target.checked)} />
            <span className="switch-track" />
          </label>
        </div>

        {remindersOn && !isReminderBackendConfigured() && (
          <p className="hint-text">
            Бот для напоминаний ещё не подключён — время сохранится, но уведомления в Telegram
            приходить не будут, пока не задеплоен воркер (см. README).
          </p>
        )}

        {remindersOn && (
          <div className="reminders-block">
            <div className="reminder-add-row">
              <input
                className="text-input reminder-time-input"
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
              />
              <button type="button" className="fab-inline" onClick={addReminderTime} aria-label="Добавить время">
                +
              </button>
            </div>
            {reminderTimes.length > 0 && (
              <div className="chip-row" style={{ marginBottom: 12 }}>
                {reminderTimes.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className="chip selected"
                    onClick={() => setReminderTimes((prev) => prev.filter((t) => t !== time))}
                  >
                    {time} ✕
                  </button>
                ))}
              </div>
            )}
            <input
              className="text-input"
              placeholder="Текст напоминания (необязательно)"
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              maxLength={100}
            />
          </div>
        )}

        <div className="toggle-row">
          <span>Заметка после отметки</span>
          <label className="switch">
            <input type="checkbox" checked={showMemo} onChange={(e) => setShowMemo(e.target.checked)} />
            <span className="switch-track" />
          </label>
        </div>

        <div className="toggle-row">
          <span>Вид графика</span>
          <div className="segmented" style={{ width: 120 }}>
            <button type="button" className={`segmented-btn ${chartType === 'bar' ? 'selected' : ''}`} onClick={() => setChartType('bar')}>
              📊
            </button>
            <button type="button" className={`segmented-btn ${chartType === 'line' ? 'selected' : ''}`} onClick={() => setChartType('line')}>
              📈
            </button>
          </div>
        </div>

        <div className="field-label" style={{ marginTop: 16 }}>
          Срок действия
        </div>
        <div className="date-range-row">
          <input className="text-input date-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span className="date-range-sep">—</span>
          <input
            className="text-input date-input"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Без конца"
          />
        </div>

        <button type="button" className="primary-btn" disabled={!canSubmit} onClick={submit}>
          {isEditing ? 'Сохранить' : 'Добавить'}
        </button>
      </div>

      {showIconPicker && (
        <IconPickerSheet
          iconType={iconType}
          icon={icon}
          onSelect={(t, i) => {
            setIconType(t)
            setIcon(i)
            setShowIconPicker(false)
          }}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  )
}
