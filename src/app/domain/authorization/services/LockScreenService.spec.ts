import CozyClient from 'cozy-client'

import { validatePassword } from '/app/domain/authorization/services/LockScreenService'

const mockGetVaultInformation = jest.fn()
const mockFetchJSON = jest.fn()
const mockDoHashPassword = jest.fn()
const mockSaveVaultInformation = jest.fn()

jest.mock('/libs/functions/passwordHelpers', () => ({
  __esModule: true,
  doHashPassword: (): { passwordHash: string } =>
    mockDoHashPassword() as { passwordHash: string }
}))

jest.mock('/libs/client', () => ({
  __esModule: true,
  getInstanceAndFqdnFromClient: jest.fn().mockReturnValue({
    fqdn: 'http://test.fqdn'
  }),
  fetchCozyPreloginData: jest.fn().mockReturnValue({
    KdfIterations: 1337
  })
}))

jest.mock('/libs/keychain', () => ({
  getVaultInformation: (): Promise<string> =>
    Promise.resolve(mockGetVaultInformation() as unknown as string),
  removeVaultInformation: jest.fn(),
  saveVaultInformation: (...args: unknown[]): Promise<void> => {
    mockSaveVaultInformation(...(args as [string, string]))
    return Promise.resolve()
  }
}))

jest.mock('cozy-client', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getStackClient: jest.fn().mockReturnValue({
      fetchJSON: mockFetchJSON,
      uri: 'http://test.cozy.tools:8080'
    })
  }))
}))

jest.mock('react-native-file-viewer', () => ({
  open: jest.fn()
}))

describe('validatePassword', () => {
  // Mocks and common setup
  let client: CozyClient
  let onSuccessMock: jest.Mock
  let onFailureMock: jest.Mock

  beforeEach(() => {
    client = new CozyClient()
    onSuccessMock = jest.fn()
    onFailureMock = jest.fn()
  })

  it('should succeed when cached password is correct and input is correct', async () => {
    // Mock the local password cache hash value
    mockGetVaultInformation.mockResolvedValue('1337')

    // Mock the input password hash value
    mockDoHashPassword.mockResolvedValueOnce({
      passwordHash: '1337'
    })

    // Mock the server response for successful cached password check
    mockFetchJSON.mockResolvedValueOnce({})

    // Call the function
    await validatePassword({
      client,
      input: 'password',
      onSuccess: onSuccessMock,
      onFailure: onFailureMock
    })

    // Assertions
    expect(onSuccessMock).toHaveBeenCalled()
    expect(mockSaveVaultInformation).not.toHaveBeenCalled()
    expect(onFailureMock).not.toHaveBeenCalled()
  })

  it('should fail when cached password is correct but user input is not correct', async () => {
    // Mock the local password cache hash value
    mockGetVaultInformation.mockResolvedValue('1337')

    // Mock the input password hash value
    mockDoHashPassword.mockResolvedValueOnce({
      passwordHash: '7331'
    })

    // Mock the server response for successful cached password check
    mockFetchJSON.mockResolvedValueOnce({})

    // Call the function
    await validatePassword({
      client,
      input: 'password',
      onSuccess: onSuccessMock,
      onFailure: onFailureMock
    })

    // Assertions
    expect(onSuccessMock).not.toHaveBeenCalled()
    expect(mockSaveVaultInformation).not.toHaveBeenCalled()
    expect(onFailureMock).toHaveBeenCalledWith('errors.badUnlockPassword')
  })

  it('should succeed when cached password is correct but user input is not correct', async () => {
    // Mock the local password cache hash value
    mockGetVaultInformation.mockResolvedValue('1337')

    // Mock the input password hash value
    mockDoHashPassword.mockResolvedValueOnce({
      passwordHash: '1337'
    })

    // Mock the server response for a failed cached password check
    mockFetchJSON.mockRejectedValueOnce({ status: 403 })

    // Mock the server response for a correct input password check
    mockFetchJSON.mockResolvedValueOnce({})

    // Call the function
    await validatePassword({
      client,
      input: 'password',
      onSuccess: onSuccessMock,
      onFailure: onFailureMock
    })

    // Assertions
    expect(onSuccessMock).toHaveBeenCalled()
    expect(mockSaveVaultInformation).toHaveBeenCalledWith(
      'passwordHash',
      '1337'
    )
    expect(onFailureMock).not.toHaveBeenCalled()
  })

  it('should fail when both cached and user input passwords are not correct', async () => {
    // Mock the local password cache hash value
    mockGetVaultInformation.mockResolvedValue('1337')

    // Mock the input password hash value
    mockDoHashPassword.mockResolvedValueOnce({
      passwordHash: '1337'
    })

    // Cached password check
    mockFetchJSON.mockRejectedValueOnce({ status: 403 })

    // User input password check
    mockFetchJSON.mockRejectedValueOnce({ status: 403 })

    // Call the function
    await validatePassword({
      client,
      input: 'password',
      onSuccess: onSuccessMock,
      onFailure: onFailureMock
    })

    // Assertions
    expect(onFailureMock).toHaveBeenCalledWith('errors.badUnlockPassword')
    expect(mockSaveVaultInformation).not.toHaveBeenCalled()
    expect(onSuccessMock).not.toHaveBeenCalled()
  })

  it('should handle unexpected server error during cached password check', async () => {
    // Mock the local password cache hash value
    mockGetVaultInformation.mockResolvedValue('1337')

    // Mock the input password hash value
    mockDoHashPassword.mockResolvedValueOnce({
      passwordHash: '1337'
    })

    // Mock server response to throw a non-403 error
    mockFetchJSON.mockRejectedValueOnce({ status: 500 }) // Cached password check

    // Call the function
    await validatePassword({
      client,
      input: 'password',
      onSuccess: onSuccessMock,
      onFailure: onFailureMock
    })

    // Assertions
    expect(onFailureMock).toHaveBeenCalledWith('errors.serverError')
    expect(mockSaveVaultInformation).not.toHaveBeenCalled()
    expect(onSuccessMock).not.toHaveBeenCalled()
  })

  it('should handle unexpected server error during input password check', async () => {
    // Mock the local password cache hash value
    mockGetVaultInformation.mockResolvedValue('1337')

    // Mock the input password hash value
    mockDoHashPassword.mockResolvedValueOnce({
      passwordHash: '1337'
    })

    // Mock the server response for a failed cached password check
    mockFetchJSON.mockRejectedValueOnce({ status: 403 })

    // Mock the server response for a correct input password check
    mockFetchJSON.mockRejectedValueOnce({ status: 500 })

    // Call the function
    await validatePassword({
      client,
      input: 'password',
      onSuccess: onSuccessMock,
      onFailure: onFailureMock
    })

    // Assertions
    expect(onFailureMock).toHaveBeenCalledWith('errors.serverError')
    expect(mockSaveVaultInformation).not.toHaveBeenCalled()
    expect(onSuccessMock).not.toHaveBeenCalled()
  })

  it('should handle network or communication errors', async () => {
    // Every fetchJSON call will throw a network error
    mockFetchJSON.mockRejectedValue(new Error('Unexpected error'))

    // Call the function
    await validatePassword({
      client,
      input: 'any-input',
      onSuccess: onSuccessMock,
      onFailure: onFailureMock
    })

    // Assertions
    expect(onFailureMock).toHaveBeenCalledWith('errors.unknown_error')
    expect(mockSaveVaultInformation).not.toHaveBeenCalled()
    expect(onSuccessMock).not.toHaveBeenCalled()
  })
})
