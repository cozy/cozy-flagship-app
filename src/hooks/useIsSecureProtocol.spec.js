import { renderHook } from '@testing-library/react-native'

import { useClient } from 'cozy-client'

import { useIsSecureProtocol } from './useIsSecureProtocol'

jest.mock('cozy-client', () => ({
  useClient: jest.fn()
}))

describe('useIsSecureProtocol', () => {
  it(`shoud return true if cozy-client's URL uses HTTPs protocol`, () => {
    useClient.mockReturnValue({
      getStackClient: () => ({
        uri: 'https://localhost:8080'
      })
    })

    const { result } = renderHook(() => {
      return useIsSecureProtocol()
    })

    expect(result.current).toBe(true)
  })

  it(`shoud return false if cozy-client's URL uses HTTP protocol`, () => {
    useClient.mockReturnValue({
      getStackClient: () => ({
        uri: 'http://localhost:8080'
      })
    })

    const { result } = renderHook(() => {
      return useIsSecureProtocol()
    })

    expect(result.current).toBe(false)
  })
})
