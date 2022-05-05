import AsyncStorage from '@react-native-async-storage/async-storage'

import * as RootNavigation from '../RootNavigation.js'
import strings from '../../strings.json'
import { localMethods, asyncLogout } from './localMethods'
jest.mock('react-native-keychain')
jest.mock('../client', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../client'),
    getClient: jest.fn()
  }
})
import { getClient } from '../client'

// eslint-disable-next-line no-import-assign
RootNavigation.navigate = jest.fn()

test('logout should handle AsyncStorage and Navigation', async () => {
  await AsyncStorage.setItem(strings.OAUTH_STORAGE_KEY, '1')
  await AsyncStorage.setItem(strings.SESSION_CREATED_FLAG, '1')

  await asyncLogout()
  expect(await AsyncStorage.getItem(strings.OAUTH_STORAGE_KEY)).toBeFalsy()
  expect(await AsyncStorage.getItem(strings.SESSION_CREATED_FLAG)).toBeFalsy()
  expect(RootNavigation.navigate).toHaveBeenCalledWith('authenticate')
})

test('backToHome should handle Navigation', async () => {
  localMethods.backToHome()

  expect(RootNavigation.navigate).toHaveBeenCalledWith('home')
})

test('fetchSessionCode should return only a session code', async () => {
  const fetchSessionCode = jest.fn()
  getClient.mockResolvedValue({ getStackClient: () => ({ fetchSessionCode }) })

  fetchSessionCode.mockResolvedValue({
    session_code: 'test_session_code'
  })

  const result = await localMethods.fetchSessionCode()

  expect(fetchSessionCode).toHaveBeenCalledTimes(1)
  expect(result).toEqual('test_session_code')
})

test('fetchSessionCode should throw if no session code is returned', async () => {
  const fetchSessionCode = jest.fn()
  getClient.mockResolvedValue({ getStackClient: () => ({ fetchSessionCode }) })

  fetchSessionCode.mockResolvedValue({
    twoFactorToken: 'token'
  })

  await expect(localMethods.fetchSessionCode()).rejects.toThrowError(
    JSON.stringify({ twoFactorToken: 'token' })
  )
  expect(fetchSessionCode).toHaveBeenCalledTimes(1)
})
