import CozyClient from 'cozy-client'

import { synchronizeDevice } from '/app/domain/authentication/services/SynchronizeService'

jest.mock('cozy-client')

describe('SynchronizeService', () => {
  let client: CozyClient

  beforeEach(() => {
    client = new CozyClient()
  })

  it('should synchronize device successfully', async () => {
    // Mock the client response for successful synchronization
    client.getStackClient = jest.fn().mockReturnValue({
      fetchJSON: jest.fn().mockResolvedValue({})
    })

    await synchronizeDevice(client)

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(client.getStackClient).toHaveBeenCalled()
    expect(client.getStackClient().fetchJSON).toHaveBeenCalledWith(
      'POST',
      '/settings/synchronized'
    )
  })
})
