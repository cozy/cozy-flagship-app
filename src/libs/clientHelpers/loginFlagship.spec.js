import { loginFlagship } from './loginFlagship'

const stackClient = {
  loginFlagship: jest.fn()
}

const client = {
  getStackClient: () => stackClient
}

describe('Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loginFlagship', () => {
    it('should call client.loginFlagship with login data', async () => {
      const loginData = {
        passwordHash: 'SOME_PASSWORD_HASH'
      }

      stackClient.loginFlagship.mockResolvedValue({ token: 'SOME_TOKEN' })

      const result = await loginFlagship({
        client,
        loginData,
        undefined
      })

      expect(stackClient.loginFlagship).toHaveBeenCalledWith({
        passwordHash: 'SOME_PASSWORD_HASH',
        twoFactorPasscode: undefined,
        twoFactorToken: undefined
      })

      expect(result).toStrictEqual({ token: 'SOME_TOKEN' })
    })

    it('should call client.loginFlagship with login data and 2FA data if present', async () => {
      const loginData = {
        passwordHash: 'SOME_PASSWORD_HASH'
      }

      const twoFactorAuthenticationData = {
        token: 'SOME_2FA_TOKEN',
        passcode: 'SOME_2FA_PASSCODE'
      }

      stackClient.loginFlagship.mockResolvedValue({ token: 'SOME_TOKEN' })

      const result = await loginFlagship({
        client,
        loginData,
        twoFactorAuthenticationData
      })

      expect(stackClient.loginFlagship).toHaveBeenCalledWith({
        passwordHash: 'SOME_PASSWORD_HASH',
        twoFactorPasscode: 'SOME_2FA_PASSCODE',
        twoFactorToken: 'SOME_2FA_TOKEN'
      })

      expect(result).toStrictEqual({ token: 'SOME_TOKEN' })
    })

    it('should handle 401 result and correlate invalidPassword when no 2FA is provided', async () => {
      const loginData = {
        passwordHash: 'SOME_PASSWORD_HASH'
      }

      stackClient.loginFlagship.mockImplementation(() => {
        const error = new Error()
        error.status = 401

        throw error
      })

      const result = await loginFlagship({
        client,
        loginData,
        undefined
      })

      expect(result).toStrictEqual({ invalidPassword: true })
    })

    it('should handle 401 result and correlate two_factor_token when no 2FA is provided but reason is filled with two_factor_token', async () => {
      const loginData = {
        passwordHash: 'SOME_PASSWORD_HASH'
      }

      stackClient.loginFlagship.mockImplementation(() => {
        const error = new Error()
        error.status = 401
        error.reason = {
          two_factor_token: 'SOME_2FA_TOKEN'
        }

        throw error
      })

      const result = await loginFlagship({
        client,
        loginData,
        undefined
      })

      expect(result).toStrictEqual({ two_factor_token: 'SOME_2FA_TOKEN' })
    })

    it('should handle 403 result and correlate two_factor_token when 2FA is provided', async () => {
      const loginData = {
        passwordHash: 'SOME_PASSWORD_HASH'
      }

      const twoFactorAuthenticationData = {
        token: 'SOME_2FA_TOKEN',
        passcode: 'SOME_2FA_PASSCODE'
      }

      stackClient.loginFlagship.mockImplementation(() => {
        const error = new Error()
        error.status = 403

        throw error
      })

      const result = await loginFlagship({
        client,
        loginData,
        twoFactorAuthenticationData
      })

      expect(result).toStrictEqual({ two_factor_token: 'SOME_2FA_TOKEN' })
    })
  })
})
