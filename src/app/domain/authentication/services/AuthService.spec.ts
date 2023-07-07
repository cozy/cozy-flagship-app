/* eslint-disable @typescript-eslint/unbound-method */
import CozyClient from 'cozy-client'

import { AuthService } from '/app/domain/authentication/services/AuthService'
import { asyncLogout } from '/libs/intents/localMethods'
const { setUserRevoked, isUserRevoked, startListening } = AuthService

jest.mock('cozy-client')
jest.mock('/libs/intents/localMethods')

const mockClient = new CozyClient() as jest.Mocked<CozyClient>
const mockAsyncLogout = asyncLogout as jest.MockedFunction<typeof asyncLogout>

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets and gets user revoked status correctly', () => {
    setUserRevoked(true)
    expect(isUserRevoked()).toBe(true)
  })

  it('handles token error correctly', () => {
    mockClient.on.mockImplementationOnce((event, callback: () => void) => {
      if (event === 'revoked') callback()
    })
    expect(isUserRevoked()).toBe(true)
  })

  it('starts listening correctly', () => {
    startListening(mockClient)
    expect(mockClient.on).toHaveBeenCalledTimes(1)
  })

  it('handles user revoked change callbacks correctly', () => {
    setUserRevoked(false)
    expect(isUserRevoked()).toBe(false)
    expect(mockAsyncLogout).toHaveBeenCalled()
  })
})
