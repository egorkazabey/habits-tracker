import { useState } from 'react'
import HabitIcon from './HabitIcon'
import type { Habit } from '../types/habit'

interface GoalLogSheetProps {
  habit: Habit
  value: number
  initialMemo: string
  onSave: (value: number, memo: string) => void
  onClose: () => void
}

export default function GoalLogSheet({ habit, value, initialMemo, onSave, onClose }: GoalLogSheetProps) {
  const [amount, setAmount] = useState(value)
  const [memo, setMemo] = useState(initialMemo)
  const step = habit.goal && habit.goal.unit.toLowerCase().startsWith('ч') ? 0.5 : 1

  const clamp = (n: number) => Math.max(0, Math.round(n * 100) / 100)

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>
            <HabitIcon habit={habit} size={18} /> {habit.name}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className="goal-stepper">
          <button type="button" className="goal-step-btn" onClick={() => setAmount((a) => clamp(a - step))}>
            −
          </button>
          <div className="goal-value">
            <input
              className="goal-value-input"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(clamp(Number(e.target.value) || 0))}
            />
            <span className="goal-unit">
              / {habit.goal?.target} {habit.goal?.unit}
            </span>
          </div>
          <button type="button" className="goal-step-btn" onClick={() => setAmount((a) => clamp(a + step))}>
            +
          </button>
        </div>

        {habit.showMemo && (
          <textarea
            className="text-input memo-textarea"
            placeholder="Заметка (необязательно)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            maxLength={280}
            rows={2}
          />
        )}

        <button type="button" className="primary-btn" style={{ background: habit.color }} onClick={() => onSave(amount, memo)}>
          Сохранить
        </button>
      </div>
    </div>
  )
}
