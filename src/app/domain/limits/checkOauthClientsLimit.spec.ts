import CozyClient from 'cozy-client'

import { checkOauthClientsLimit } from '/app/domain/limits/checkOauthClientsLimit'

jest.mock('cozy-client')

describe('checkOauthClientsLimit', () => {
  let client: CozyClient

  beforeEach(() => {
    client = new CozyClient()
  })

  it('should return false when limitExceeded is false', async () => {
    client.getStackClient = jest.fn().mockReturnValue({
      fetchJSON: jest.fn().mockResolvedValue({
        data: {
          attributes: {
            limitExceeded: false
          }
        }
      })
    })

    const result = await checkOauthClientsLimit(client)

    expect(result).toBe(false)
  })

  it('should return false when limitExceeded is true', async () => {
    client.getStackClient = jest.fn().mockReturnValue({
      fetchJSON: jest.fn().mockResolvedValue({
        data: {
          attributes: {
            limitExceeded: true
          }
        }
      })
    })

    const result = await checkOauthClientsLimit(client)

    expect(result).toBe(true)
  })

  describe('should not produce false positivies that would block the user', () => {
    it(`should return false if any error`, async () => {
      client.getStackClient = jest.fn().mockReturnValue({
        fetchJSON: jest.fn().mockImplementation(() => {
          throw new Error('SOME ERROR')
        })
      })

      const result = await checkOauthClientsLimit(client)

      expect(result).toBe(false)
    })

    it(`should return false if result's attributes is null`, async () => {
      client.getStackClient = jest.fn().mockReturnValue({
        fetchJSON: jest.fn().mockResolvedValue({
          data: {}
        })
      })

      const result = await checkOauthClientsLimit(client)

      expect(result).toBe(false)
    })
  })
})
