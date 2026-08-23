import { useState } from 'react'
import { HABIT_EMOJIS, HABIT_ICON_CATEGORIES } from '../lib/constants'
import type { IconCategory } from '../lib/constants'
import { ICON_REGISTRY } from '../lib/iconRegistry'
import type { IconType } from '../types/habit'

interface IconPickerSheetProps {
  iconType: IconType
  icon: string
  onSelect: (iconType: IconType, icon: string) => void
  onClose: () => void
}

export default function IconPickerSheet({ iconType, icon, onSelect, onClose }: IconPickerSheetProps) {
  const [tab, setTab] = useState<IconType>(iconType)
  const [category, setCategory] = useState<IconCategory>('sports')

  return (
    <div
      className="sheet-overlay"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>Иконка</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className="segmented" style={{ marginBottom: 16 }}>
          <button type="button" className={`segmented-btn ${tab === 'emoji' ? 'selected' : ''}`} onClick={() => setTab('emoji')}>
            Эмодзи
          </button>
          <button type="button" className={`segmented-btn ${tab === 'icon' ? 'selected' : ''}`} onClick={() => setTab('icon')}>
            Иконки
          </button>
        </div>

        {tab === 'emoji' ? (
          <div className="emoji-grid">
            {HABIT_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                className={`emoji-btn ${tab === iconType && e === icon ? 'selected' : ''}`}
                onClick={() => onSelect('emoji', e)}
              >
                {e}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="segmented wrap" style={{ marginBottom: 12 }}>
              {Object.values(HABIT_ICON_CATEGORIES).map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`segmented-btn ${category === cat.key ? 'selected' : ''}`}
                  onClick={() => setCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="emoji-grid">
              {HABIT_ICON_CATEGORIES[category].icons.map((name) => {
                const Icon = ICON_REGISTRY[name]
                if (!Icon) return null
                return (
                  <button
                    key={name}
                    type="button"
                    className={`emoji-btn ${tab === iconType && name === icon ? 'selected' : ''}`}
                    onClick={() => onSelect('icon', name)}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
