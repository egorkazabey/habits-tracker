interface SettingsScreenProps {
  onResetAll: () => void
}

export default function SettingsScreen({ onResetAll }: SettingsScreenProps) {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Настройки</h1>
      </header>

      <div className="card-block">
        <div className="section-title">О приложении</div>
        <p className="settings-text">
          Привычки хранятся в облаке Telegram и привязаны к вашему аккаунту — доступны на любом
          устройстве, где вы открываете этого бота.
        </p>
      </div>

      <div className="card-block">
        <div className="section-title">Данные</div>
        <button type="button" className="danger-btn" onClick={onResetAll}>
          Удалить все привычки и историю
        </button>
      </div>
    </div>
  )
}
