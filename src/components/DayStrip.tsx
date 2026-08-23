import { getWeekDays, isSameDay, weekdayLabel } from '../lib/date'

interface DayStripProps {
  selectedDate: Date
  today: Date
  onSelect: (date: Date) => void
}

export default function DayStrip({ selectedDate, today, onSelect }: DayStripProps) {
  const days = getWeekDays(selectedDate)

  return (
    <div className="day-strip">
      {days.map((date) => {
        const isSelected = isSameDay(date, selectedDate)
        const isToday = isSameDay(date, today)
        return (
          <button
            type="button"
            key={date.toISOString()}
            className={`day-strip-cell ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(date)}
          >
            <span className="day-strip-label">{weekdayLabel(date)}</span>
            <span className="day-strip-num">
              {date.getDate()}
              {isToday && <span className="day-strip-today-dot" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
