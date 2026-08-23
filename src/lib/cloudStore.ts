import { getWebApp, isInsideTelegram } from './telegram'

const LOCAL_PREFIX = 'habits_dev_'

// The telegram-web-app.js script defines window.Telegram.WebApp.CloudStorage
// even outside a real Telegram client, but its calls fail there, so we gate
// on isInsideTelegram() (real launch params) rather than the object's presence.
const hasCloudStorage = isInsideTelegram

export function cloudGetItems(keys: string[]): Promise<Record<string, string>> {
  if (keys.length === 0) return Promise.resolve({})
  if (!hasCloudStorage()) {
    const result: Record<string, string> = {}
    for (const key of keys) {
      const value = localStorage.getItem(LOCAL_PREFIX + key)
      if (value !== null) result[key] = value
    }
    return Promise.resolve(result)
  }
  return new Promise((resolve, reject) => {
    getWebApp()!.CloudStorage.getItems(keys, (error, values) => {
      if (error) reject(error)
      else resolve(values ?? {})
    })
  })
}

export function cloudSetItem(key: string, value: string): Promise<void> {
  if (!hasCloudStorage()) {
    localStorage.setItem(LOCAL_PREFIX + key, value)
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    getWebApp()!.CloudStorage.setItem(key, value, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

export function cloudRemoveItems(keys: string[]): Promise<void> {
  if (keys.length === 0) return Promise.resolve()
  if (!hasCloudStorage()) {
    for (const key of keys) localStorage.removeItem(LOCAL_PREFIX + key)
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    getWebApp()!.CloudStorage.removeItems(keys, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

export function cloudGetKeys(): Promise<string[]> {
  if (!hasCloudStorage()) {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(LOCAL_PREFIX)) keys.push(key.slice(LOCAL_PREFIX.length))
    }
    return Promise.resolve(keys)
  }
  return new Promise((resolve, reject) => {
    getWebApp()!.CloudStorage.getKeys((error, keys) => {
      if (error) reject(error)
      else resolve(keys ?? [])
    })
  })
}
