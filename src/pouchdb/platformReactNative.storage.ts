import AsyncStorage from '@react-native-async-storage/async-storage'

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    return AsyncStorage.getItem(key)
  },
  setItem: async (key: string, value: string | undefined): Promise<void> => {
    if (value === undefined) return
    return AsyncStorage.setItem(key, value)
  },
  removeItem: async (key: string): Promise<void> => {
    return AsyncStorage.removeItem(key)
  }
}
