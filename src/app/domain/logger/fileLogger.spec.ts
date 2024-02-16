import AsyncStorage from '@react-native-async-storage/async-storage'
import { FileLogger } from 'react-native-file-logger'
import { Alert } from 'react-native'

import CozyClient from 'cozy-client'

import {
  configureFileLogger,
  disableLogs,
  enableLogs,
  sendLogs
} from '/app/domain/logger/fileLogger'
import { fetchSupportMail } from '/app/domain/logger/supportEmail'
import * as SplashScreenService from '/app/theme/SplashScreenService'
import {
  DevicePersistedStorageKeys,
  getData,
  storeData
} from '/libs/localStore'

jest.mock('react-native-file-logger')
jest.mock('/app/domain/logger/supportEmail')
jest.mock('/app/theme/SplashScreenService')

jest.spyOn(Alert, 'alert')

// Spies are needed on FileLogger to prevent `unbound-method` eslint error
const enableConsoleCaptureSpy = jest.spyOn(FileLogger, 'enableConsoleCapture')
const disableConsoleCaptureSpy = jest.spyOn(FileLogger, 'disableConsoleCapture')
const deleteLogFilesSpy = jest.spyOn(FileLogger, 'deleteLogFiles')
const sendLogFilesByEmailSpy = jest.spyOn(FileLogger, 'sendLogFilesByEmail')
const configureSpy = jest.spyOn(FileLogger, 'configure')

const hideSplashScreenSpy = jest.spyOn(SplashScreenService, 'hideSplashScreen')
const showSplashScreenSpy = jest.spyOn(SplashScreenService, 'showSplashScreen')

const mockFetchSupportMail = fetchSupportMail as jest.Mock

describe('fileLogger', () => {
  describe('enableLogs', () => {
    it('should enable ConsoleCapture', async () => {
      await enableLogs()

      expect(enableConsoleCaptureSpy).toHaveBeenCalled()
    })

    it('should store enabled state in AsyncStorage', async () => {
      await storeData(DevicePersistedStorageKeys.LogsEnabled, false)

      await enableLogs()

      expect(await getData(DevicePersistedStorageKeys.LogsEnabled)).toBe(true)
    })
  })

  describe('disableLogs', () => {
    it('should disable ConsoleCapture', async () => {
      await disableLogs()

      expect(disableConsoleCaptureSpy).toHaveBeenCalled()
    })

    it('should store disabled state in AsyncStorage', async () => {
      await storeData(DevicePersistedStorageKeys.LogsEnabled, true)

      await disableLogs()

      expect(await getData(DevicePersistedStorageKeys.LogsEnabled)).toBe(false)
    })

    it('should delete log file', async () => {
      await disableLogs()

      expect(deleteLogFilesSpy).toHaveBeenCalled()
    })
  })

  describe('sendLogs', () => {
    it('should send logs', async () => {
      await storeData(DevicePersistedStorageKeys.LogsEnabled, true)
      const client = new CozyClient()

      mockFetchSupportMail.mockResolvedValue('somemail@somedomain.com')

      await sendLogs(client)

      expect(Alert.alert).not.toHaveBeenCalled()
      expect(sendLogFilesByEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Log file for ',
          to: 'somemail@somedomain.com'
        })
      )
    })

    it('should do nothing and display alert if logs are disabled', async () => {
      await storeData(DevicePersistedStorageKeys.LogsEnabled, false)
      const client = new CozyClient()

      await sendLogs(client)

      expect(Alert.alert).toHaveBeenCalled()
      expect(sendLogFilesByEmailSpy).not.toHaveBeenCalled()
    })

    it('should show SplashScreen before sending email and hide it after', async () => {
      await storeData(DevicePersistedStorageKeys.LogsEnabled, true)
      const client = new CozyClient()

      await sendLogs(client)

      const showSplashScreenOrder =
        showSplashScreenSpy.mock.invocationCallOrder[0]
      const hideSplashScreenOrder =
        hideSplashScreenSpy.mock.invocationCallOrder[0]
      const sendLogFilesByEmailOder =
        sendLogFilesByEmailSpy.mock.invocationCallOrder[0]

      expect(showSplashScreenOrder).toBeLessThan(sendLogFilesByEmailOder)
      expect(sendLogFilesByEmailOder).toBeLessThan(hideSplashScreenOrder)
    })
  })

  describe('configureFileLogger', () => {
    it('should configure FileLogger and enable ConsoleCapture if logs are enabled', async () => {
      await storeData(DevicePersistedStorageKeys.LogsEnabled, true)

      await configureFileLogger()

      expect(configureSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          captureConsole: false
        })
      )
      expect(enableConsoleCaptureSpy).toHaveBeenCalled()
    })

    it('should configure FileLogger with ConsoleCapture disabled if logs are disabled', async () => {
      await storeData(DevicePersistedStorageKeys.LogsEnabled, false)

      await configureFileLogger()

      expect(configureSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          captureConsole: false
        })
      )
      expect(enableConsoleCaptureSpy).not.toHaveBeenCalled()
    })

    it('should configure FileLogger with ConsoleCapture disabled if logs are not configured in AsyncStorage', async () => {
      await AsyncStorage.clear()

      await configureFileLogger()

      expect(configureSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          captureConsole: false
        })
      )
      expect(enableConsoleCaptureSpy).not.toHaveBeenCalled()
    })
  })
})
