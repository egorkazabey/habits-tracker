import { useEffect, useState } from 'react'

export function getWebApp() {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
}

export const isInsideTelegram = () => Boolean(getWebApp()?.initData)

export function initTelegram() {
  const webApp = getWebApp()
  if (!webApp) return
  webApp.ready()
  webApp.expand()
}

export function getTelegramUser() {
  return getWebApp()?.initDataUnsafe.user
}

export function haptic(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') {
  getWebApp()?.HapticFeedback.impactOccurred(style)
}

export function hapticNotify(type: 'error' | 'success' | 'warning') {
  getWebApp()?.HapticFeedback.notificationOccurred(type)
}

export function hapticSelect() {
  getWebApp()?.HapticFeedback.selectionChanged()
}

export function useTelegramTheme() {
  const webApp = getWebApp()
  const [scheme, setScheme] = useState<'light' | 'dark'>(webApp?.colorScheme ?? 'light')

  useEffect(() => {
    if (!webApp) return
    const onChange = () => setScheme(webApp.colorScheme)
    webApp.onEvent('themeChanged', onChange)
    return () => webApp.offEvent('themeChanged', onChange)
  }, [webApp])

  return scheme
}

export function useBackButton(visible: boolean, onClick: () => void) {
  useEffect(() => {
    const webApp = getWebApp()
    if (!webApp) return
    if (visible) {
      webApp.BackButton.show()
      webApp.BackButton.onClick(onClick)
    } else {
      webApp.BackButton.hide()
    }
    return () => {
      webApp.BackButton.offClick(onClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])
}

export function useTelegramThemeVars() {
  useEffect(() => {
    const webApp = getWebApp()
    if (!webApp) return
    const apply = () => {
      const root = document.documentElement
      const tp = webApp.themeParams
      const set = (name: string, value?: string) => {
        if (value) root.style.setProperty(name, value)
      }
      set('--tg-bg', tp.bg_color)
      set('--tg-text', tp.text_color)
      set('--tg-hint', tp.hint_color)
      set('--tg-button', tp.button_color)
      set('--tg-button-text', tp.button_text_color)
      set('--tg-secondary-bg', tp.secondary_bg_color)
      set('--tg-section-bg', tp.section_bg_color ?? tp.secondary_bg_color)
    }
    apply()
    webApp.onEvent('themeChanged', apply)
    return () => webApp.offEvent('themeChanged', apply)
  }, [])
}

export function useMainButton(options: { text: string; visible: boolean; onClick: () => void }) {
  const { text, visible, onClick } = options
  useEffect(() => {
    const webApp = getWebApp()
    if (!webApp) return
    webApp.MainButton.setText(text)
    if (visible) {
      webApp.MainButton.show()
      webApp.MainButton.onClick(onClick)
    } else {
      webApp.MainButton.hide()
    }
    return () => {
      webApp.MainButton.offClick(onClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, visible])
}
