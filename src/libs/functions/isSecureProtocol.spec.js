import { isSecureProtocol } from './isSecureProtocol'

jest.mock('cozy-client', () => ({
  useClient: jest.fn()
}))

describe('isSecureProtocol', () => {
  it(`shoud return true if cozy-client's URL uses HTTPs protocol`, () => {
    const client = {
      getStackClient: () => ({
        uri: 'https://localhost:8080'
      })
    }

    const result = isSecureProtocol(client)

    expect(result).toBe(true)
  })

  it(`shoud return false if cozy-client's URL uses HTTP protocol`, () => {
    const client = {
      getStackClient: () => ({
        uri: 'http://localhost:8080'
      })
    }

    const result = isSecureProtocol(client)

    expect(result).toBe(false)
  })
})
