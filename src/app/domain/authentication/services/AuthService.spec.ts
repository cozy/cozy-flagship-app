/* eslint-disable @typescript-eslint/unbound-method */
import { Linking } from 'react-native'

import {
  handleSupportEmail,
  startListening
} from '/app/domain/authentication/services/AuthService'

import CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn()
  }
}))

jest.mock('cozy-minilog', () => {
  const mockLogFunctions = {
    debug: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }

  return {
    __esModule: true,
    default: (): MiniLogger => mockLogFunctions
  }
})

jest.mock('cozy-client', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    removeListener: jest.fn()
  }))
}))

jest.mock('cozy-client', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    removeListener: jest.fn()
  }))
}))

jest.mock('/app/domain/authentication/utils/asyncLogoutNoClient', () =>
  Promise.resolve()
)

const mockLinking = Linking as jest.Mocked<typeof Linking>

describe('AuthService', () => {
  let mockClient: CozyClient
  let mockLog: MiniLogger

  beforeEach(() => {
    mockClient = new CozyClient()
    mockLog = Minilog('test')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('opens the mail app when handleSupportEmail is called', () => {
    handleSupportEmail()
    expect(mockLinking.openURL).toHaveBeenCalledWith('mailto:support@twake.app')
  })

  it('logs an error when handleSupportEmail fails', () => {
    mockLinking.openURL.mockImplementationOnce(() => {
      throw new Error('Error opening email app')
    })

    handleSupportEmail()
    expect(mockLog.error).toHaveBeenCalledWith(
      'Error while opening email app',
      expect.any(Error)
    )
  })

  it('starts listening to events when startListening is called', () => {
    startListening(mockClient)
    expect(mockLog.info).toHaveBeenCalledWith(
      'Start listening to cozy-client events'
    )
    expect(mockClient.on).toHaveBeenCalledWith('revoked', expect.any(Function))
  })
})
