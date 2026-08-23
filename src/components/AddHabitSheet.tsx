import { useState } from 'react'
import { HABIT_COLORS, HABIT_EMOJIS } from '../lib/constants'

interface AddHabitSheetProps {
  onSubmit: (data: { name: string; emoji: string; color: string }) => void
  onClose: () => void
}

export default function AddHabitSheet({ onSubmit, onClose }: AddHabitSheetProps) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0])
  const [color, setColor] = useState(HABIT_COLORS[0])

  const canSubmit = name.trim().length > 0

  const submit = () => {
    if (!canSubmit) return
    onSubmit({ name: name.trim(), emoji, color })
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

        <button type="button" className="primary-btn" disabled={!canSubmit} onClick={submit}>
          Добавить
        </button>
      </div>
    </div>
  )
}
