import CozyClient from 'cozy-client'

import { IsSensorAvailableResult } from '/app/domain/authentication/models/Device'
import { getDevModeFunctions } from '/app/domain/authorization/utils/devMode'
import { isDev } from '/core/tools/env'

const mockedIsDev = isDev as jest.Mock
jest.mock('/core/tools/env', () => ({
  isDev: jest.fn()
}))

describe('getDevModeFunctions', () => {
  const prodFns = {
    isDeviceSecured: async (): Promise<boolean> => Promise.resolve(true),
    isAutoLockEnabled: async (): Promise<boolean> => Promise.resolve(true),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hasDefinedPassword: async (_client: CozyClient): Promise<boolean> =>
      Promise.resolve(true),
    getBiometricType: async (): Promise<IsSensorAvailableResult> =>
      Promise.resolve({ available: true })
  }

  const devConfig = {
    isDeviceSecured: async (): Promise<boolean> => Promise.resolve(false),
    isAutoLockEnabled: undefined
  }

  it('returns prodFns when not in dev mode', async () => {
    mockedIsDev.mockReturnValue(false)

    const fns = getDevModeFunctions(prodFns, devConfig)

    expect(await fns.isDeviceSecured()).toBe(true)
    expect(await fns.isAutoLockEnabled()).toBe(true)
  })

  it('returns dev functions when in dev mode and devConfig is not null', async () => {
    mockedIsDev.mockReturnValue(true)

    const fns = getDevModeFunctions(prodFns, devConfig)

    expect(await fns.isDeviceSecured()).toBe(false) // Dev value used
    expect(await fns.isAutoLockEnabled()).toBe(true) // Prod value still returned
    expect(await fns.hasDefinedPassword({} as CozyClient)).toBe(true) // Prod value still returned
  })
})
