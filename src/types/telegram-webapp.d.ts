export interface TelegramWebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export interface TelegramWebAppInitDataUnsafe {
  user?: TelegramWebAppUser
}

export interface TelegramCloudStorage {
  setItem(key: string, value: string, callback?: (error: unknown, success?: boolean) => void): void
  getItem(key: string, callback: (error: unknown, value?: string) => void): void
  getItems(keys: string[], callback: (error: unknown, values?: Record<string, string>) => void): void
  removeItem(key: string, callback?: (error: unknown, success?: boolean) => void): void
  removeItems(keys: string[], callback?: (error: unknown, success?: boolean) => void): void
  getKeys(callback: (error: unknown, keys?: string[]) => void): void
}

export interface TelegramHapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
  notificationOccurred(type: 'error' | 'success' | 'warning'): void
  selectionChanged(): void
}

export interface TelegramBackButton {
  isVisible: boolean
  show(): void
  hide(): void
  onClick(cb: () => void): void
  offClick(cb: () => void): void
}

export interface TelegramMainButton {
  text: string
  isVisible: boolean
  isActive: boolean
  show(): void
  hide(): void
  enable(): void
  disable(): void
  setText(text: string): void
  onClick(cb: () => void): void
  offClick(cb: () => void): void
  setParams(params: Record<string, unknown>): void
}

export interface TelegramThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
  header_bg_color?: string
  accent_text_color?: string
  section_bg_color?: string
  section_header_text_color?: string
  subtitle_text_color?: string
  destructive_text_color?: string
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: TelegramWebAppInitDataUnsafe
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: TelegramThemeParams
  isExpanded: boolean
  viewportHeight: number
  CloudStorage: TelegramCloudStorage
  HapticFeedback: TelegramHapticFeedback
  BackButton: TelegramBackButton
  MainButton: TelegramMainButton
  ready(): void
  expand(): void
  close(): void
  setHeaderColor(color: string): void
  setBackgroundColor(color: string): void
  onEvent(event: 'themeChanged' | 'viewportChanged' | 'backButtonClicked' | 'mainButtonClicked', cb: () => void): void
  offEvent(event: 'themeChanged' | 'viewportChanged' | 'backButtonClicked' | 'mainButtonClicked', cb: () => void): void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}
