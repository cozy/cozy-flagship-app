import { FileLogger } from 'react-native-file-logger'
import Mailer from 'react-native-mail'
import { Alert } from 'react-native'

import CozyClient from 'cozy-client'
// @ts-expect-error Not typed
import { makeSharingLink } from 'cozy-client/dist/models/sharing'

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
  storeData,
  storage
} from '/libs/localStore'

jest.mock('cozy-client/dist/models/sharing')
jest.mock('react-native-file-logger')
jest.mock('react-native-mail')
jest.mock('/app/domain/logger/supportEmail')
jest.mock('/app/theme/SplashScreenService')
jest.mock('/app/domain/upload/services')
jest.mock('/app/domain/upload/services')

jest.spyOn(Alert, 'alert')

// Spies are needed on FileLogger to prevent `unbound-method` eslint error
const enableConsoleCaptureSpy = jest.spyOn(FileLogger, 'enableConsoleCapture')
const disableConsoleCaptureSpy = jest.spyOn(FileLogger, 'disableConsoleCapture')
const deleteLogFilesSpy = jest.spyOn(FileLogger, 'deleteLogFiles')
const sendLogFilesByEmailSpy = jest.spyOn(FileLogger, 'sendLogFilesByEmail')
const configureSpy = jest.spyOn(FileLogger, 'configure')
const mailSpy = jest.spyOn(Mailer, 'mail')

const hideSplashScreenSpy = jest.spyOn(SplashScreenService, 'hideSplashScreen')
const showSplashScreenSpy = jest.spyOn(SplashScreenService, 'showSplashScreen')

const mockFetchSupportMail = fetchSupportMail as jest.Mock
const mockMail = Mailer.mail as jest.Mock
const mockMakeSharingLink = makeSharingLink as jest.Mock
// eslint-disable-next-line @typescript-eslint/unbound-method
const mockGetLogFilePathsSpy = FileLogger.getLogFilePaths as jest.Mock

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
    it('should send logs link when CozyClient exists', async () => {
      await storeData(DevicePersistedStorageKeys.LogsEnabled, true)
      const client = {
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        getStackClient: () => ({
          uri: 'https://claude.mycozy.cloud',
          token: {
            accessToken: 'SOME_ACCESS_TOKEN'
          }
        }),
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        collection: () => ({
          ensureDirectoryExists: jest.fn().mockResolvedValue('SOME_ID')
        })
      } as unknown as CozyClient

      mockFetchSupportMail.mockResolvedValue('somemail@somedomain.com')
      mockMakeSharingLink.mockResolvedValue('https://some_uploaded_link')
      mockMail.mockImplementation((body, callback: () => void) => callback())
      mockGetLogFilePathsSpy.mockResolvedValue([
        'SOME/FILE/PATH/1.log',
        'SOME/FILE/PATH/2.log'
      ])

      await sendLogs(client)

      expect(Alert.alert).not.toHaveBeenCalled()
      expect(sendLogFilesByEmailSpy).not.toHaveBeenCalled()
      expect(mailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Log file for https://claude.mycozy.cloud',
          recipients: ['somemail@somedomain.com']
        }),
        expect.anything()
      )
    })

    it('should send logs files when no CozyClient exists', async () => {
      await storeData(DevicePersistedStorageKeys.LogsEnabled, true)
      const client = undefined

      mockFetchSupportMail.mockResolvedValue('somemail@somedomain.com')

      await sendLogs(client)

      expect(Alert.alert).not.toHaveBeenCalled()
      expect(sendLogFilesByEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Log file for not logged app',
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
      const client = {
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        getStackClient: () => ({
          uri: 'https://claude.mycozy.cloud',
          token: {
            accessToken: 'SOME_ACCESS_TOKEN'
          }
        }),
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        collection: () => ({
          ensureDirectoryExists: jest.fn().mockResolvedValue('SOME_ID')
        })
      } as unknown as CozyClient

      mockFetchSupportMail.mockResolvedValue('somemail@somedomain.com')
      mockMakeSharingLink.mockResolvedValue('https://some_uploaded_link')
      mockMail.mockImplementation((body, callback: () => void) => callback())
      mockGetLogFilePathsSpy.mockResolvedValue([
        'SOME/FILE/PATH/1.log',
        'SOME/FILE/PATH/2.log'
      ])

      await sendLogs(client)

      const showSplashScreenOrder =
        showSplashScreenSpy.mock.invocationCallOrder[0]
      const hideSplashScreenOrder =
        hideSplashScreenSpy.mock.invocationCallOrder[0]
      const sendEmailOrder = mailSpy.mock.invocationCallOrder[0]

      expect(showSplashScreenOrder).toBeLessThan(sendEmailOrder)
      expect(sendEmailOrder).toBeLessThan(hideSplashScreenOrder)
    })

    it('should show SplashScreen before sending email and hide it after', async () => {
      await storeData(DevicePersistedStorageKeys.LogsEnabled, true)
      const client = undefined

      await sendLogs(client)

      const showSplashScreenOrder =
        showSplashScreenSpy.mock.invocationCallOrder[0]
      const hideSplashScreenOrder =
        hideSplashScreenSpy.mock.invocationCallOrder[0]
      const sendLogFilesByEmailOrder =
        sendLogFilesByEmailSpy.mock.invocationCallOrder[0]

      expect(showSplashScreenOrder).toBeLessThan(sendLogFilesByEmailOrder)
      expect(sendLogFilesByEmailOrder).toBeLessThan(hideSplashScreenOrder)
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
      storage.clearAll()

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
