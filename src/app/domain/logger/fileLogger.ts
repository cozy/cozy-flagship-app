import { Alert } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { FileLogger, LogLevel } from 'react-native-file-logger'

import type CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { fetchSupportMail } from '/app/domain/logger/supportEmail'
import { sendEmailToSupport } from '/app/domain/supportEmailer/sendEmail'
import {
  cleanTempDir,
  saveToTempDir
} from '/app/domain/supportEmailer/temporaryFile'
import {
  File,
  uploadFilesToSupportFolder
} from '/app/domain/supportEmailer/uploadFiles'
import {
  hideSplashScreen,
  showSplashScreen,
  splashScreens
} from '/app/theme/SplashScreenService'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
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

  if (!client) {
    return sendLogsByEmailOnly()
  }

  try {
    const subject = 'Log file'

    const logFilePaths = await FileLogger.getLogFilePaths()

    const logFiles: File[] = []
    for (const logFilePath of logFilePaths) {
      const fileName = getFileNameFromPath(logFilePath)

      const filePath = await saveToTempDir(client, logFilePath, fileName)

      logFiles.push({
        name: fileName,
        path: filePath,
        mimetype: '.log'
      })
    }

    const link = await uploadFilesToSupportFolder(logFiles, client)
    await sendEmailToSupport(subject, link, client)

    await cleanTempDir(client)
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error('Error while trying to send log email', errorMessage)
  }
}

const sendLogsByEmailOnly = async (): Promise<void> => {
  const supportEmail = await fetchSupportMail(undefined)

  const subject = `Log file for not logged app`

  await showSplashScreen(splashScreens.SEND_LOG_EMAIL)
  log.info('Start email intent')
  const emailResult = await FileLogger.sendLogFilesByEmail({
    to: supportEmail,
    subject: subject,
    body: buildMessageBody()
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

const buildMessageBody = (): string => {
  const appVersion = DeviceInfo.getVersion()
  const appBuild = DeviceInfo.getBuildNumber()
  const bundle = DeviceInfo.getBundleId()
  const deviceBrand = DeviceInfo.getBrand()
  const deviceModel = DeviceInfo.getModel()
  const os = DeviceInfo.getSystemName()
  const version = DeviceInfo.getSystemVersion()

  const appInfo = `App info: ${appVersion} (${appBuild})`
  const bundleInfo = `App bundle: ${bundle}`
  const deviceInfo = `Device info: ${deviceBrand} ${deviceModel} ${os} ${version}`

  return `${appInfo}\n${bundleInfo}\n${deviceInfo}`
}

const getFileNameFromPath = (path: string): string => {
  const pathParts = path.split('/')

  const fileName = pathParts.at(-1)

  return fileName ?? 'unknown.txt'
}
