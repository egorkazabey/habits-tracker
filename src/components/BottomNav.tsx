export type Tab = 'home' | 'overview' | 'report' | 'settings'

interface BottomNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

const TABS: { value: Tab; label: string; icon: string }[] = [
  { value: 'home', label: 'Главная', icon: '🏠' },
  { value: 'overview', label: 'Обзор', icon: '📊' },
  { value: 'report', label: 'Отчёт', icon: '📋' },
  { value: 'settings', label: 'Настройки', icon: '⚙️' },
]

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className={`bottom-nav-btn ${active === tab.value ? 'active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span className="bottom-nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
