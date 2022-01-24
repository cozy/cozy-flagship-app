import AsyncStorage from '@react-native-async-storage/async-storage'

import {createMockClient} from 'cozy-client/dist/mock'

import {
  consumeSessionToken,
  handleCreateSession,
  handleInterceptAuth,
  resetSessionToken,
  shouldCreateSession,
  shouldInterceptAuth,
} from './session'

import strings from '../../strings.json'

const session_code = '123'
const uri = 'http://cozy.10-0-2-2.nip.io:8080'
const client = createMockClient({})
const subdomain = 'nested'

client.getStackClient = jest.fn(() => ({
  fetchSessionCode: () => Promise.resolve({session_code}),
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
      `${uri}/?session_code=${session_code}`,
    )
  })

  it('does not delete already existing query strings', async () => {
    expect(await handleCreateSession(client)(new URL(`${uri}/?foo=bar`))).toBe(
      `${uri}/?foo=bar&session_code=${session_code}`,
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
  it('throws with invalid URL as redirect', async () => {
    await expect(
      async () =>
        await handleInterceptAuth(
          client,
          subdomain,
        )(`${uri}/auth/login?redirect=bar`),
    ).rejects.toThrow()
  })

  it('throws with empty redirect', async () => {
    await expect(
      async () =>
        await handleInterceptAuth(
          client,
          subdomain,
        )(`${uri}/auth/login?redirect=`),
    ).rejects.toThrow()
  })

  it('returns redirect value with existing params and appended params', async () => {
    expect(
      await handleInterceptAuth(client)(
        `${uri}/auth/login?redirect=${uri}/?foo=bar`,
      ),
    ).toBe(`${uri}/?foo=bar&session_code=${session_code}`)
  })

  it('returns a secured url for nested', async () => {
    await expect(
      async () =>
        await handleInterceptAuth(
          client,
          subdomain,
        )(
          `${uri}/auth/login?redirect=http%3A%2F%2Fhackerman.cozy-home.10-0-2-2.nip.io.hack%2F#/whatever`,
        ),
    ).rejects.toThrow()
  })

  it('returns a secured url for flat', async () => {
    await expect(
      async () =>
        await handleInterceptAuth(
          client,
          subdomain,
        )(
          `${uri}/auth/login?redirect=http%3A%2F%2Fhackerman.home.cozy.10-0-2-2.nip.io.hack%2F#/whatever`,
        ),
    ).rejects.toThrow()
  })

  it('returns a secured url', async () => {
    expect(
      await handleInterceptAuth(
        client,
        subdomain,
      )(
        `${uri}/auth/login?redirect=http%3A%2F%2Fhome.cozy.10-0-2-2.nip.io%2F#/whatever`,
      ),
    ).toBe('http://home.cozy.10-0-2-2.nip.io/?session_code=123#/whatever')
  })

  it('returns a secured url with flat subdomain', async () => {
    expect(
      await handleInterceptAuth(
        client,
        'flat',
      )(
        `${uri}/auth/login?redirect=http%3A%2F%2Fcozy-home.10-0-2-2.nip.io%2F#/whatever`,
      ),
    ).toBe('http://cozy-home.10-0-2-2.nip.io/?session_code=123#/whatever')
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
