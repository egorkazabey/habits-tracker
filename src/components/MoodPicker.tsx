import { MOOD_EMOJIS } from '../lib/constants'

interface MoodPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export default function MoodPicker({ onSelect, onClose }: MoodPickerProps) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet mood-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="field-label">Как настроение сегодня?</div>
        <div className="mood-row">
          {MOOD_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="mood-btn"
              onClick={() => onSelect(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
