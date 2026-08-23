CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_user_id INTEGER NOT NULL,
  habit_id TEXT NOT NULL,
  habit_name TEXT NOT NULL,
  message TEXT NOT NULL,
  hour_utc INTEGER NOT NULL,
  minute_utc INTEGER NOT NULL,
  weekdays_mask INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders (telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_time ON reminders (hour_utc, minute_utc);
