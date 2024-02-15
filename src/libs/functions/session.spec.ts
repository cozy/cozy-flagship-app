import type CozyClient from 'cozy-client'
// @ts-expect-error : cozy-client has to be updated
import type { StackClient } from 'cozy-stack-client'

import { makeSessionAPI } from './session'

import {
  StorageKeys,
  getData,
  storeData,
  clearAllData
} from '/libs/localStore/storage'

const session_code = '123'
const uri = 'http://cozy.10-0-2-2.nip.io:8080'
const client = {} as jest.Mocked<CozyClient>

const subdomain = 'nested'

client.getStackClient = jest.fn(
  (): StackClient => ({
    fetchSessionCode: (): Promise<{ session_code: string }> =>
      Promise.resolve({ session_code }),
    uri
  })
)

const {
  shouldCreateSession,
  handleCreateSession,
  shouldInterceptAuth,
  handleInterceptAuth,
  consumeSessionToken,
  resetSessionToken
} = makeSessionAPI(client, subdomain)

describe('shouldCreateSession', () => {
  it('returns true when no token is found', async () => {
    await clearAllData()
    expect(await shouldCreateSession()).toBe(true)
  })

  it('returns false when a token is found', async () => {
    await storeData(StorageKeys.SessionCreated, '1')
    expect(await shouldCreateSession()).toBe(false)
  })
})

describe('handleCreateSession', () => {
  it('returns an url with an appended session code', async () => {
    expect(await handleCreateSession(new URL(uri))).toBe(
      `${uri}/?session_code=${session_code}`
    )
  })

  it('does not delete already existing query strings', async () => {
    expect(await handleCreateSession(new URL(`${uri}/?foo=bar`))).toBe(
      `${uri}/?foo=bar&session_code=${session_code}`
    )
  })
})

describe('shouldInterceptAuth', () => {
  it('returns false if no redirect is detected', () => {
    expect(shouldInterceptAuth(uri)).toBe(false)
  })

  it('returns true if a redirect is detected', () => {
    expect(
      shouldInterceptAuth(`${uri}/auth/login?redirect=http://bar.foo`)
    ).toBe(true)
  })
})

describe('handleInterceptAuth', () => {
  it('throws with invalid URL as redirect', async () => {
    await expect(
      async () => await handleInterceptAuth(`${uri}/auth/login?redirect=bar`)
    ).rejects.toThrow()
  })

  it('throws with empty redirect', async () => {
    await expect(
      async () => await handleInterceptAuth(`${uri}/auth/login?redirect=`)
    ).rejects.toThrow()
  })

  it('returns redirect value with existing params and appended params', async () => {
    expect(
      await handleInterceptAuth(
        `${uri}/auth/login?redirect=http://home.cozy.10-0-2-2.nip.io/?foo=bar`
      )
    ).toBe(
      `http://home.cozy.10-0-2-2.nip.io/?foo=bar&session_code=${session_code}`
    )
  })

  it('throws when unsecured url for nested', async () => {
    await expect(
      async () =>
        await handleInterceptAuth(
          `${uri}/auth/login?redirect=http%3A%2F%2Fhackerman.cozy-home.10-0-2-2.nip.io.hack%2F#/whatever`
        )
    ).rejects.toThrow()
  })

  it('throws when secured url for flat', async () => {
    await expect(
      async () =>
        await makeSessionAPI(client, 'flat').handleInterceptAuth(
          `${uri}/auth/login?redirect=http%3A%2F%2Fhackerman.home.cozy.10-0-2-2.nip.io.hack%2F#/whatever`
        )
    ).rejects.toThrow()
  })

  it('returns a secured url', async () => {
    expect(
      await handleInterceptAuth(
        `${uri}/auth/login?redirect=http%3A%2F%2Fhome.cozy.10-0-2-2.nip.io%2F#/whatever`
      )
    ).toBe('http://home.cozy.10-0-2-2.nip.io/?session_code=123#/whatever')
  })

  it('returns a secured url with flat subdomain', async () => {
    expect(
      await makeSessionAPI(client, 'flat').handleInterceptAuth(
        `${uri}/auth/login?redirect=http%3A%2F%2Fcozy-home.10-0-2-2.nip.io%2F#/whatever`
      )
    ).toBe('http://cozy-home.10-0-2-2.nip.io/?session_code=123#/whatever')
  })
})

describe('consumeSessionToken', () => {
  it('stores a value in the asyncStorage', async () => {
    await consumeSessionToken()
    expect(await getData(StorageKeys.SessionCreated)).toBeTruthy()
  })
})

describe('resetSessionToken', () => {
  it('stores a value in the asyncStorage', async () => {
    await resetSessionToken()
    expect(await getData(StorageKeys.SessionCreated)).toBeFalsy()
  })
})
