import { storage as mmkvStorage } from '/libs/localStore'

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    return Promise.resolve(mmkvStorage.getString(key) ?? null)
  },
  setItem: async (key: string, value: string | undefined): Promise<void> => {
    if (value === undefined) return
    return Promise.resolve(mmkvStorage.set(key, value))
  },
  removeItem: async (key: string): Promise<void> => {
    return Promise.resolve(mmkvStorage.delete(key))
  }
}
