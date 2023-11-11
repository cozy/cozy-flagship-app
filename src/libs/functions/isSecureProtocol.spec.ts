import type CozyClient from 'cozy-client'

import { isSecureProtocol } from './isSecureProtocol'

jest.mock('cozy-client', () => ({
  useClient: jest.fn()
}))

describe('isSecureProtocol', () => {
  it(`shoud return true if cozy-client's URL uses HTTPs protocol`, () => {
    const result = isSecureProtocol({
      getStackClient: (): { uri: string } => ({
        uri: 'https://localhost:8080'
      })
    } as unknown as jest.Mocked<CozyClient>)

    expect(result).toBe(true)
  })

  it(`shoud return false if cozy-client's URL uses HTTP protocol`, () => {
    const result = isSecureProtocol({
      getStackClient: (): { uri: string } => ({
        uri: 'http://localhost:8080'
      })
    } as unknown as jest.Mocked<CozyClient>)

    expect(result).toBe(false)
  })
})
