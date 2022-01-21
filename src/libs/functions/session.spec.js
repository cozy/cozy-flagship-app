import AsyncStorage from '@react-native-async-storage/async-storage'

import {createMockClient} from 'cozy-client/dist/mock'

import strings from '../../strings.json'
import {
  shouldCreateSession,
  handleCreateSession,
  shouldInterceptAuth,
  handleInterceptAuth,
  consumeSessionToken,
  resetSessionToken,
} from './session'

const sessionCode = '123'
const uri = 'http://foo.bar'
const client = createMockClient({})

client.getStackClient = jest.fn(() => ({
  fetchSessionCode: () => Promise.resolve({session_code: sessionCode}),
  uri,
}))

describe('shouldCreateSession', () => {
  it('returns true when no token is found', async () => {
    AsyncStorage.clear()
    expect(await shouldCreateSession()).toBe(true)
  })

  it('returns false when a token is found', async () => {
    AsyncStorage.setItem(strings.SESSION_CREATED_FLAG, '1')
    expect(await shouldCreateSession()).toBe(false)
  })
})

describe('handleCreateSession', () => {
  it('returns an url with an appended session code', async () => {
    expect(await handleCreateSession(client)(new URL(uri))).toBe(
      `${uri}/?session_code=${sessionCode}`,
    )
  })

  it('does not delete already existing query strings', async () => {
    expect(await handleCreateSession(client)(new URL(`${uri}/?foo=bar`))).toBe(
      `${uri}/?foo=bar&session_code=${sessionCode}`,
    )
  })
})

describe('shouldInterceptAuth', () => {
  it('returns false if no redirect is detected', () => {
    expect(shouldInterceptAuth(client)(uri)).toBe(false)
  })

  it('returns true if a redirect is detected', () => {
    expect(
      shouldInterceptAuth(client)(`${uri}/auth/login?redirect=http://bar.foo`),
    ).toBe(true)
  })
})

describe('handleInterceptAuth', () => {
  it('returns redirect value with appended params', async () => {
    expect(
      await handleInterceptAuth(client)(`${uri}/auth/login?redirect=bar`),
    ).toBe(`bar/?session_code=${sessionCode}`)
  })

  it('throws with empty redirect', async () => {
    await expect(
      async () =>
        await handleInterceptAuth(client)(`${uri}/auth/login?redirect=`),
    ).rejects.toThrow()
  })

  it('returns redirect value with existing params and appended params', async () => {
    expect(
      await handleInterceptAuth(client)(
        `${uri}/auth/login?redirect=${uri}/?foo=bar`,
      ),
    ).toBe(`${uri}/?foo=bar&session_code=${sessionCode}`)
  })
})

describe('consumeSessionToken', () => {
  it('stores a value in the asyncStorage', async () => {
    await consumeSessionToken()
    expect(
      await AsyncStorage.getItem(strings.SESSION_CREATED_FLAG),
    ).toBeTruthy()
  })
})

describe('resetSessionToken', () => {
  it('stores a value in the asyncStorage', async () => {
    await resetSessionToken()
    expect(await AsyncStorage.getItem(strings.SESSION_CREATED_FLAG)).toBeFalsy()
  })
})
