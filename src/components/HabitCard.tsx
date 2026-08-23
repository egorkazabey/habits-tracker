interface HabitCardProps {
  name: string
  emoji: string
  color: string
  done: boolean
  streak: number
  onToggle: () => void
  onOpen: () => void
}

export default function HabitCard({ name, emoji, color, done, streak, onToggle, onOpen }: HabitCardProps) {
  return (
    <div className="habit-card" onClick={onOpen}>
      <div className="habit-emoji" style={{ background: `${color}26` }}>
        {emoji}
      </div>
      <div className="habit-info">
        <div className="habit-name">{name}</div>
        <div className="habit-streak">{streak > 0 ? `🔥 ${streak} ${dayWord(streak)} подряд` : 'Начни сегодня'}</div>
      </div>
      <button
        type="button"
        className={`habit-check ${done ? 'done' : ''}`}
        style={done ? { background: color, borderColor: color } : undefined}
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        aria-label={done ? 'Отметить как не выполнено' : 'Отметить как выполнено'}
      >
        {done ? '✓' : ''}
      </button>
    </div>
  )
}

function dayWord(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'дня'
  return 'дней'
}
