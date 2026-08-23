import { useState } from 'react'

interface MemoPromptProps {
  habitName: string
  initialText: string
  onSave: (text: string) => void
  onSkip: () => void
}

export default function MemoPrompt({ habitName, initialText, onSave, onSkip }: MemoPromptProps) {
  const [text, setText] = useState(initialText)

  return (
    <div className="sheet-overlay" onClick={onSkip}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>{habitName}</h2>
          <button type="button" className="icon-btn" onClick={onSkip} aria-label="Пропустить">
            ✕
          </button>
        </div>

        <textarea
          className="text-input memo-textarea"
          placeholder="Заметка (необязательно)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          maxLength={280}
          rows={3}
        />

        <button type="button" className="primary-btn" onClick={() => onSave(text)}>
          Сохранить
        </button>
      </div>
    </div>
  )
}
