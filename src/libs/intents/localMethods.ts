import { Linking } from 'react-native'
import { getDeviceName } from 'react-native-device-info'
import { BrowserResult } from 'react-native-inappbrowser-reborn'

import CozyClient from 'cozy-client'
import { FlagshipUI, NativeMethodsRegister } from 'cozy-intent'
import Minilog from 'cozy-minilog'

import * as RootNavigation from '/libs/RootNavigation'
import { isIapAvailable } from '/app/domain/iap/services/availableOffers'
import {
  scanDocument,
  isScannerAvailable
} from '/app/domain/scanner/services/scanner'
import { processOcr, isOcrAvailable } from '/app/domain/ocr/services/ocr'
import { printBase64Doc as print } from '/libs/intents/printBase64Doc'
import { setHomeThemeIntent } from '/libs/intents/setHomeThemeIntent'
import strings from '/constants/strings.json'
import { EnvService } from '/core/tools/env'
import { clearCookies } from '/libs/httpserver/httpCookieManager'
import { clearCozyData } from '/libs/localStore/storage'
import { deleteKeychain } from '/libs/keychain'
import { hideSplashScreen } from '/app/theme/SplashScreenService'
import { openApp } from '/libs/functions/openApp'
import { routes } from '/constants/routes'
import { sendKonnectorsLogs } from '/libs/konnectors/sendKonnectorsLogs'
import { setDefaultRedirection } from '/libs/defaultRedirection/defaultRedirection'
import { setFlagshipUI } from '/libs/intents/setFlagshipUI'
import { showInAppBrowser, closeInAppBrowser } from '/libs/intents/InAppBrowser'
import { isBiometryDenied } from '/app/domain/authentication/services/BiometryService'
import { toggleSetting } from '/app/domain/settings/services/SettingsService'
import { HomeThemeParams } from '/app/theme/models'
import {
  prepareBackup,
  startBackup,
  stopBackup,
  checkBackupPermissions,
  requestBackupPermissions
} from '/app/domain/backup/services/manageBackup'
import { sendProgressToWebview } from '/app/domain/backup/services/manageProgress'
import { BackupInfo, ProgressCallback } from '/app/domain/backup/models'
import { changeLanguage } from '/locales/i18n'
import {
  getGeolocationTrackingStatus,
  stopTrackingAndClearData,
  getGeolocationTrackingId,
  setGeolocationTrackingId,
  setGeolocationTracking,
  sendGeolocationTrackingLogs,
  forceUploadGeolocationTrackingData
} from '/app/domain/geolocation/services/tracking'
import {
  checkPermissions,
  requestPermissions
} from '/app/domain/nativePermissions'
import { t } from '/locales/i18n'

const log = Minilog('localMethods')

export const asyncLogout = async (client?: CozyClient): Promise<null> => {
  if (!client) {
    throw new Error('Logout should not be called with undefined client')
  }

  await sendKonnectorsLogs(client)
  await client.logout()
  await stopTrackingAndClearData()
  await deleteKeychain()
  await clearCookies()
  await clearCozyData()
  RootNavigation.reset(routes.welcome, { screen: 'welcome' })
  return Promise.resolve(null)
}

export const backToHome = (): Promise<null> => {
  const isOnHomeScreen =
    RootNavigation.navigationRef.current?.getCurrentRoute()?.name === 'default'

  if (!isOnHomeScreen) RootNavigation.navigate('default')

  return Promise.resolve(null)
}

const isAvailable = (featureName: string): Promise<boolean> => {
  if (featureName === 'geolocationTracking') {
    return Promise.resolve(true)
  } else if (featureName === 'ocr') {
    return Promise.resolve(isOcrAvailable())
  } else if (featureName === 'backup') {
    return Promise.resolve(true)
  } else if (featureName === 'scanner') {
    return Promise.resolve(isScannerAvailable())
  } else if (featureName === 'print') {
    return Promise.resolve(true)
  } else if (featureName === 'shareFiles') {
    return Promise.resolve(true)
  } else if (featureName === 'iap') {
    return isIapAvailable()
  }

  return Promise.resolve(false)
}

/**
 * Get the fetchSessionCode function to be called with current CozyClient instance
 * fetchSessionCode gets a session code from the current cozy-client instance
 */
const fetchSessionCodeWithClient = (
  client?: CozyClient
): (() => Promise<string | null>) => {
  return async function fetchSessionCode() {
    if (!client) {
      return null
    }

    const sessionCodeResult = await client.getStackClient().fetchSessionCode()

    if (sessionCodeResult.session_code) {
      return sessionCodeResult.session_code
    }

    throw new Error(
      'session code result should contain a session_code ' +
        JSON.stringify(sessionCodeResult)
    )
  }
}

const openAppOSSettings = async (): Promise<null> => {
  await Linking.openSettings()
  return null
}

const setDefaultRedirectionWithClient = async (
  defaultRedirection: string,
  client?: CozyClient
): Promise<null> => {
  if (!client) {
    return null
  }

  await setDefaultRedirection(defaultRedirection, client)

  return null
}

export const internalMethods = {
  setFlagshipUI: (intent: FlagshipUI): Promise<null> => {
    const caller = (): string => {
      if (!EnvService.nameIs(strings.environments.test)) return 'unknown'

      try {
        return internalMethods.setFlagshipUI.caller.name
      } catch (error) {
        return 'unknown'
      }
    }

    return setFlagshipUI(intent, caller())
  }
}

export const setLang = async (lng: string): Promise<void> => {
  return await changeLanguage(lng)
}

const isNativePassInstalledOnDevice = async (): Promise<boolean> => {
  return await Linking.canOpenURL('cozypass://')
}

interface DeviceInfo {
  deviceName: string
}

const getDeviceInfo = async (): Promise<DeviceInfo> => ({
  deviceName: await getDeviceName()
})

interface CustomMethods {
  fetchSessionCode: () => Promise<string | null>
  showInAppBrowser: (args: { url: string }) => Promise<BrowserResult>
  setTheme: (theme: HomeThemeParams) => Promise<boolean>
  prepareBackup: (onProgress: ProgressCallback) => Promise<BackupInfo>
  startBackup: (onProgress: ProgressCallback) => Promise<BackupInfo>
  stopBackup: () => Promise<BackupInfo>
  checkPermissions: typeof checkPermissions
  requestPermissions: typeof requestPermissions
  checkBackupPermissions: typeof checkBackupPermissions
  requestBackupPermissions: typeof requestBackupPermissions
  setLang: typeof setLang
  getGeolocationTrackingStatus: typeof getGeolocationTrackingStatus
  setGeolocationTracking: typeof setGeolocationTracking
  sendGeolocationTrackingLogs: typeof sendGeolocationTrackingLogs
  getGeolocationTrackingId: typeof getGeolocationTrackingId
  setGeolocationTrackingId: typeof setGeolocationTrackingId
  forceUploadGeolocationTrackingData: typeof forceUploadGeolocationTrackingData
  getDeviceInfo: typeof getDeviceInfo
  isAvailable: typeof isAvailable
  print: typeof print
}

let prepareBackupLock = false

const prepareBackupWithClient = async (
  client: CozyClient | undefined
): Promise<BackupInfo> => {
  if (!client) {
    throw new Error('You must be logged in to use backup feature')
  }

  const onProgress = (backupInfo: BackupInfo): Promise<void> =>
    sendProgressToWebview(client, backupInfo)

  if (prepareBackupLock) {
    throw new Error(t('services.backup.errors.backupPreparing'))
  }

  prepareBackupLock = true

  let backupInfo

  try {
    backupInfo = await prepareBackup(client, onProgress)
  } catch (e) {
    prepareBackupLock = false
    throw e
  }
  prepareBackupLock = false
  return backupInfo
}

let startBackupLock = false

const startBackupWithClient = async (
  client: CozyClient | undefined
): Promise<BackupInfo> => {
  if (!client) {
    throw new Error('You must be logged in to use backup feature')
  }

  const onProgress = (backupInfo: BackupInfo): Promise<void> =>
    sendProgressToWebview(client, backupInfo)

  if (startBackupLock) {
    throw new Error(t('services.backup.errors.backupRunning'))
  }

  startBackupLock = true

  let backupInfo

  try {
    backupInfo = await startBackup(client, onProgress)
  } catch (e) {
    startBackupLock = false
    throw e
  }
  startBackupLock = false
  return backupInfo
}

const stopBackupWithClient = (
  client: CozyClient | undefined
): Promise<BackupInfo> => {
  if (!client) {
    throw new Error('You must be logged in to use backup feature')
  }

  return stopBackup(client)
}

/**
 * For now cozy-intent doesn't accept methods resolving to void.
 * We can use this wrapper to still execute an async method an resolve to null no matter what.
 */
const nativeMethodWrapper =
  <T extends () => Promise<void>>(method: T) =>
  async (): Promise<null> => {
    await method()

    return null
  }

export const localMethods = (
  client: CozyClient | undefined,
  ...rest: Record<string, Promise<unknown>>[]
): NativeMethodsRegister | CustomMethods => {
  const mergedMethods = Object.assign({}, ...rest) as Record<
    string,
    Promise<unknown>
  >

  return {
    backToHome,
    closeInAppBrowser,
    fetchSessionCode: fetchSessionCodeWithClient(client),
    hideSplashScreen: nativeMethodWrapper(hideSplashScreen),
    logout: () => asyncLogout(client),
    openApp: (href, app, iconParams) =>
      openApp(client, RootNavigation, href, app, iconParams),
    toggleSetting,
    setDefaultRedirection: defaultRedirection =>
      setDefaultRedirectionWithClient(defaultRedirection, client),
    setFlagshipUI,
    showInAppBrowser,
    isBiometryDenied,
    openAppOSSettings,
    isNativePassInstalledOnDevice,
    scanDocument,
    isScannerAvailable: (): Promise<boolean> => {
      log.debug(
        "Please use intent.call('isAvailable', 'scanner') instead of intent.call('isScannerAvailable')"
      )
      return Promise.resolve(isScannerAvailable())
    },
    ocr: processOcr,
    // For now setTheme is only used for the home theme
    setTheme: setHomeThemeIntent,
    prepareBackup: () => prepareBackupWithClient(client),
    startBackup: () => startBackupWithClient(client),
    stopBackup: () => stopBackupWithClient(client),
    checkPermissions,
    requestPermissions,
    checkBackupPermissions,
    requestBackupPermissions,
    setLang,
    getGeolocationTrackingStatus: () => getGeolocationTrackingStatus(client),
    setGeolocationTracking,
    getGeolocationTrackingId,
    setGeolocationTrackingId,
    sendGeolocationTrackingLogs: () => sendGeolocationTrackingLogs(client),
    forceUploadGeolocationTrackingData,
    getDeviceInfo,
    isAvailable,
    print,
    ...mergedMethods
  }
}
