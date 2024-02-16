import { Alert } from 'react-native'
import { FileLogger, LogLevel } from 'react-native-file-logger'

import type CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { fetchSupportMail } from '/app/domain/logger/supportEmail'
import {
  hideSplashScreen,
  showSplashScreen,
  splashScreens
} from '/app/theme/SplashScreenService'
import {
  DevicePersistedStorageKeys,
  getData,
  storeData
} from '/libs/localStore/storage'
import { t } from '/locales/i18n'

const log = Minilog('🗒️ File Logger')

export const configureFileLogger = async (): Promise<void> => {
  log.info('Configure file logger')
  await FileLogger.configure({
    logLevel: LogLevel.Info,
    captureConsole: false
  })

  if (await areLogsEnabledInAsyncStorage()) {
    log.info('Console capture is enabled')
    FileLogger.enableConsoleCapture()
  } else {
    log.info('Console capture is disabled')
  }
}

export const sendLogs = async (client?: CozyClient): Promise<void> => {
  log.info('Send logs')

  const areLogsEnabled = await areLogsEnabledInAsyncStorage()
  if (!areLogsEnabled) {
    return showDisabledLogsError()
  }

  const supportEmail = await fetchSupportMail(client)

  const instance = client?.getStackClient().uri ?? 'not logged app'

  const subject = `Log file for ${instance}`

  await showSplashScreen(splashScreens.SEND_LOG_EMAIL)
  log.info('Start email intent')
  const emailResult = await FileLogger.sendLogFilesByEmail({
    to: supportEmail,
    subject: subject
  })
  log.info('Did finish email intent:', emailResult)
  await hideSplashScreen(splashScreens.SEND_LOG_EMAIL)
}

const showDisabledLogsError = (): void => {
  Alert.alert(
    t('modals.LogDisabledError.title'),
    t('modals.LogDisabledError.body'),
    undefined,
    {
      cancelable: true
    }
  )
}

export const enableLogs = async (): Promise<void> => {
  log.info('Enable logs')
  FileLogger.enableConsoleCapture()
  await enableLogsInAsyncStorage()
}

export const disableLogs = async (): Promise<void> => {
  log.info('Disable logs and delete log files')
  FileLogger.disableConsoleCapture()
  await disableLogsInAsyncStorage()
  await FileLogger.deleteLogFiles()
}

const enableLogsInAsyncStorage = (): Promise<void> => {
  return storeData(DevicePersistedStorageKeys.LogsEnabled, true)
}

const disableLogsInAsyncStorage = (): Promise<void> => {
  return storeData(DevicePersistedStorageKeys.LogsEnabled, false)
}

const areLogsEnabledInAsyncStorage = async (): Promise<boolean> => {
  const logsEnabled = await getData(DevicePersistedStorageKeys.LogsEnabled)

  return logsEnabled === true
}
