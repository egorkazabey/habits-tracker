import { useState } from 'react'
import { HABIT_COLORS, HABIT_EMOJIS, TIME_OF_DAY_OPTIONS } from '../lib/constants'
import type { HabitType, TimeOfDay } from '../types/habit'

interface AddHabitSheetProps {
  onSubmit: (data: {
    name: string
    emoji: string
    color: string
    type: HabitType
    goal?: { target: number; unit: string }
    timeOfDay: TimeOfDay
  }) => void
  onClose: () => void
}

export default function AddHabitSheet({ onSubmit, onClose }: AddHabitSheetProps) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0])
  const [color, setColor] = useState(HABIT_COLORS[0])
  const [type, setType] = useState<HabitType>('boolean')
  const [target, setTarget] = useState(1)
  const [unit, setUnit] = useState('раз')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime')

  const canSubmit = name.trim().length > 0 && (type === 'boolean' || (target > 0 && unit.trim().length > 0))

  const submit = () => {
    if (!canSubmit) return
    onSubmit({
      name: name.trim(),
      emoji,
      color,
      type,
      goal: type === 'goal' ? { target, unit: unit.trim() } : undefined,
      timeOfDay,
    })
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>Новая привычка</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <input
          className="text-input"
          placeholder="Например: Пить воду"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          maxLength={40}
        />

        <div className="field-label">Тип</div>
        <div className="segmented" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={`segmented-btn ${type === 'boolean' ? 'selected' : ''}`}
            onClick={() => setType('boolean')}
          >
            Да / нет
          </button>
          <button
            type="button"
            className={`segmented-btn ${type === 'goal' ? 'selected' : ''}`}
            onClick={() => setType('goal')}
          >
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

        <div className="field-label">Иконка</div>
        <div className="emoji-grid">
          {HABIT_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className={`emoji-btn ${e === emoji ? 'selected' : ''}`}
              onClick={() => setEmoji(e)}
            >
              {e}
            </button>
          ))}
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

        <div className="field-label">Время суток</div>
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

        <button type="button" className="primary-btn" disabled={!canSubmit} onClick={submit}>
          Добавить
        </button>
      </div>
    </div>
  )
}
