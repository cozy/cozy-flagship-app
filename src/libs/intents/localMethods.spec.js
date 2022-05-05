import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Keychain from 'react-native-keychain'

import * as RootNavigation from '../RootNavigation.js'
import strings from '../../strings.json'
import { localMethods, asyncLogout } from './localMethods'

jest.mock('react-native-keychain')
jest.mock('../RootNavigation.js')
jest.mock('../client', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../client'),
    getClient: jest.fn()
  }
})
import { getClient } from '../client'

describe('asyncLogout', () => {
  beforeEach(() => {
    AsyncStorage.setItem(strings.OAUTH_STORAGE_KEY, '1')
    AsyncStorage.setItem(strings.SESSION_CREATED_FLAG, '1')
  })

  it('should remove session and oauth storage from AsyncStorage', async () => {
    await asyncLogout()

    expect(await AsyncStorage.getItem(strings.OAUTH_STORAGE_KEY)).toBeNull()
    expect(await AsyncStorage.getItem(strings.SESSION_CREATED_FLAG)).toBeNull()
  })

  it('should delete keychain', async () => {
    await asyncLogout()

    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith()
  })

  it('should handle Navigate to authenticate page and prevent go back', async () => {
    await asyncLogout()

    expect(RootNavigation.reset).toHaveBeenCalledWith('authenticate')
  })
})

describe('backToHome', () => {
  it('should handle Navigation', async () => {
    localMethods.backToHome()

    expect(RootNavigation.navigate).toHaveBeenCalledWith('home')
  })
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
