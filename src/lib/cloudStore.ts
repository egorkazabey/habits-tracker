import { getWebApp, isInsideTelegram } from './telegram'

const LOCAL_PREFIX = 'habits_dev_'

// The telegram-web-app.js script defines window.Telegram.WebApp.CloudStorage
// even outside a real Telegram client, but its calls fail there, so we gate
// on isInsideTelegram() (real launch params). We also require the CloudStorage
// object itself to exist: older Telegram clients support basic Mini Apps
// (initData) without CloudStorage (added in Bot API 6.9) — on those, fall back
// to localStorage rather than have every write silently fail.
function hasCloudStorage() {
  return isInsideTelegram() && Boolean(getWebApp()?.CloudStorage)
}

function localGetItems(keys: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key of keys) {
    const value = localStorage.getItem(LOCAL_PREFIX + key)
    if (value !== null) result[key] = value
  }
  return result
}

export async function cloudGetItems(keys: string[]): Promise<Record<string, string>> {
  if (keys.length === 0) return {}
  if (!hasCloudStorage()) return localGetItems(keys)
  try {
    return await new Promise<Record<string, string>>((resolve, reject) => {
      getWebApp()!.CloudStorage.getItems(keys, (error, values) => {
        if (error) reject(error)
        else resolve(values ?? {})
      })
    })
  } catch {
    // CloudStorage exists but this call failed (older client quirk, transient
    // error, …) — fall back to whatever we have locally rather than losing data.
    return localGetItems(keys)
  }
}

export async function cloudSetItem(key: string, value: string): Promise<void> {
  // Always mirror to localStorage: it's the source of truth when CloudStorage
  // is unavailable, and a same-session safety net when it briefly fails.
  try {
    localStorage.setItem(LOCAL_PREFIX + key, value)
  } catch {
    // e.g. storage disabled/full — proceed to try CloudStorage regardless.
  }
  if (!hasCloudStorage()) return
  try {
    await new Promise<void>((resolve, reject) => {
      getWebApp()!.CloudStorage.setItem(key, value, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  } catch {
    // Already saved to localStorage above; this write just won't be on other devices this time.
  }
}

export async function cloudRemoveItems(keys: string[]): Promise<void> {
  if (keys.length === 0) return
  for (const key of keys) localStorage.removeItem(LOCAL_PREFIX + key)
  if (!hasCloudStorage()) return
  try {
    await new Promise<void>((resolve, reject) => {
      getWebApp()!.CloudStorage.removeItems(keys, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  } catch {
    // Already removed locally above.
  }
}

function localGetKeys(): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(LOCAL_PREFIX)) keys.push(key.slice(LOCAL_PREFIX.length))
  }
  return keys
}

export async function cloudGetKeys(): Promise<string[]> {
  if (!hasCloudStorage()) return localGetKeys()
  try {
    return await new Promise<string[]>((resolve, reject) => {
      getWebApp()!.CloudStorage.getKeys((error, keys) => {
        if (error) reject(error)
        else resolve(keys ?? [])
      })
    })
  } catch {
    return localGetKeys()
  }
}
