import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Keychain from 'react-native-keychain'

import CozyClient from 'cozy-client/types/CozyClient.js'

import * as RootNavigation from '/libs/RootNavigation.js'
import strings from '/constants/strings.json'
import { localMethods, asyncLogout } from '/libs/intents/localMethods'

import { NativeMethodsRegister } from 'cozy-intent'

jest.mock('react-native-keychain')
jest.mock('../RootNavigation.js')
jest.mock('@react-native-cookies/cookies', () => ({
  clearAll: jest.fn()
}))

describe('asyncLogout', () => {
  const client = {
    logout: jest.fn()
  } as unknown as CozyClient

  beforeEach(async () => {
    await AsyncStorage.setItem(strings.OAUTH_STORAGE_KEY, '1')
    await AsyncStorage.setItem(strings.SESSION_CREATED_FLAG, '1')
  })

  it('should remove session and oauth storage from AsyncStorage', async () => {
    await asyncLogout(client)

    expect(await AsyncStorage.getItem(strings.OAUTH_STORAGE_KEY)).toBeNull()
    expect(await AsyncStorage.getItem(strings.SESSION_CREATED_FLAG)).toBeNull()
  })

  it('should delete keychain', async () => {
    await asyncLogout(client)

    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith()
  })

  it('should handle Navigate to authenticate page and prevent go back', async () => {
    await asyncLogout(client)

    expect(RootNavigation.reset).toHaveBeenCalledWith('welcome', {
      screen: 'welcome'
    })
  })
})

describe('backToHome', () => {
  it('should handle Navigation', async () => {
    const client = {} as unknown as CozyClient

    await (localMethods(client) as NativeMethodsRegister).backToHome()

    expect(RootNavigation.navigate).toHaveBeenCalledWith('default')
  })
})

test('fetchSessionCode should return only a session code', async () => {
  const fetchSessionCode = jest.fn()

  fetchSessionCode.mockResolvedValue({
    session_code: 'test_session_code'
  })
  const client = {
    getStackClient: (): { fetchSessionCode: jest.Mock } => ({
      fetchSessionCode
    })
  } as CozyClient

  const result = await localMethods(client).fetchSessionCode()

  expect(fetchSessionCode).toHaveBeenCalledTimes(1)
  expect(result).toEqual('test_session_code')
})

test('fetchSessionCode should throw if no session code is returned', async () => {
  const fetchSessionCode = jest.fn()
  const client = {
    getStackClient: (): { fetchSessionCode: jest.Mock } => ({
      fetchSessionCode
    })
  } as CozyClient

  fetchSessionCode.mockResolvedValue({
    twoFactorToken: 'token'
  })

  await expect(localMethods(client).fetchSessionCode()).rejects.toThrowError(
    'session code result should contain a session_code ' +
      JSON.stringify({ twoFactorToken: 'token' })
  )
  expect(fetchSessionCode).toHaveBeenCalledTimes(1)
})
