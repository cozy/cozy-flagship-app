import { AppState, Platform } from 'react-native'

let shouldStopBackup = false

export const getShouldStopBackup = (): boolean => {
  return shouldStopBackup
}

export const setShouldStopBackup = (value: boolean): void => {
  shouldStopBackup = value
}

export const shouldStopBecauseBackground = (): boolean => {
  if (Platform.OS === 'android' && Platform.Version < 31) {
    return false
  }

  return AppState.currentState === 'background'
}
