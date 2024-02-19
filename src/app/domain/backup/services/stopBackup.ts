import { AppState, NativeEventSubscription, Platform } from 'react-native'

import { t } from '/locales/i18n'

export type StopBackupReason = 'STOPPED_BY_USER' | 'STOPPED_BECAUSE_BACKGROUND'

interface StopBackupData {
  shouldStop: boolean
  reason: StopBackupReason | undefined
  translatedReason: string
}

let stopBackupData: StopBackupData = {
  shouldStop: false,
  reason: undefined,
  translatedReason: ''
}

const translateStopBackupReason = (
  reason: StopBackupReason | undefined
): string => {
  if (reason === 'STOPPED_BY_USER') {
    return t('services.backup.errors.backupStopped')
  } else if (reason === 'STOPPED_BECAUSE_BACKGROUND') {
    return t('services.backup.errors.appKilled')
  }

  return ''
}

export const getStopBackupData = (): StopBackupData => {
  return stopBackupData
}

export const setStopBackupData = (
  newStopBackupData: Omit<StopBackupData, 'translatedReason'>
): void => {
  stopBackupData = {
    ...newStopBackupData,
    translatedReason: translateStopBackupReason(newStopBackupData.reason)
  }
}

export const resetStopBackupData = (): void => {
  stopBackupData = {
    shouldStop: false,
    reason: undefined,
    translatedReason: ''
  }
}

export const addBackgroundSubscriptionListener = (
  callback: () => void
): NativeEventSubscription => {
  return AppState.addEventListener('change', nextAppState => {
    if (Platform.OS === 'android' && Platform.Version < 31) {
      return
    }

    if (nextAppState === 'background') {
      callback()
    }
  })
}
