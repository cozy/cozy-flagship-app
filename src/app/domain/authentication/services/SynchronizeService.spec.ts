/* eslint-disable @typescript-eslint/unbound-method */
import CozyClient from 'cozy-client'

import * as SynchronizeService from '/app/domain/authentication/services/SynchronizeService'

const {
  checkClientName,
  getClientName,
  syncLog,
  synchronizeDevice,
  synchronizeOnInit
} = SynchronizeService

// @ts-expect-error TS see this as a const but we can edit it on tests runtime
SynchronizeService.SYNCHRONIZE_DELAY_IN_MS = 0

jest.mock('cozy-client')

describe('SynchronizeService', () => {
  let client: CozyClient
  let syncLogInfoSpy: jest.SpyInstance

  afterEach(() => {
    jest.restoreAllMocks()
  })

  beforeEach(() => {
    client = new CozyClient()
    syncLogInfoSpy = jest.spyOn(syncLog, 'info')
  })

  it('should synchronize device successfully', async () => {
    client.getStackClient = jest.fn().mockReturnValue({
      fetchJSON: jest.fn().mockResolvedValue({})
    })

    await synchronizeDevice(client)

    expect(client.getStackClient).toHaveBeenCalled()
    expect(client.getStackClient().fetchJSON).toHaveBeenCalledWith(
      'POST',
      '/settings/synchronized'
    )
  })

  it("should update the client name if it doesn't start with the software name", async () => {
    const mockResponse = {
      data: {
        foo: 'bar'
      }
    }

    client.getStackClient = jest.fn().mockReturnValue({
      oauthOptions: { clientName: 'wrongName' },
      updateInformation: jest.fn().mockResolvedValue(mockResponse)
    })

    await checkClientName(client)

    expect(client.getStackClient).toHaveBeenCalled()
    expect(client.getStackClient().updateInformation).toHaveBeenCalledWith({
      clientName: await getClientName()
    })
    expect(syncLogInfoSpy).toHaveBeenNthCalledWith(
      1,
      'Updating client name...',
      { oldClientName: 'wrongName' }
    )
    expect(syncLogInfoSpy).toHaveBeenNthCalledWith(
      2,
      `Client name updated with "${await getClientName()}"`,
      { OAuthOptions: { data: mockResponse.data } }
    )
  })

  it('should not update the client name if it starts with the software name', async () => {
    client.getStackClient = jest.fn().mockReturnValue({
      oauthOptions: { clientName: await getClientName() },
      updateInformation: jest.fn().mockResolvedValue({})
    })

    await checkClientName(client)

    expect(client.getStackClient).toHaveBeenCalled()
    expect(client.getStackClient().updateInformation).not.toHaveBeenCalled()
  })

  it('should log an error if updating the client name fails', async () => {
    const mockError = new Error('update failed')

    syncLog.error = jest.fn()

    client.getStackClient = jest.fn().mockReturnValue({
      oauthOptions: { clientName: 'wrongName' },
      updateInformation: jest.fn().mockRejectedValueOnce(mockError)
    })

    await checkClientName(client)

    expect(client.getStackClient().updateInformation).toHaveBeenCalled()
    expect(syncLog.error).toHaveBeenCalledWith(
      'Failed to update clientName',
      mockError.message
    )
  })

  it('should call synchronizeDevice after checkClientName has resolved in synchronizeOnInit', async () => {
    jest.useRealTimers()

    client.getStackClient = jest.fn().mockReturnValue({
      oauthOptions: { clientName: 'wrongName' },
      updateInformation: jest.fn().mockResolvedValueOnce({})
    })

    const checkClientNameSpy = jest
      .spyOn(SynchronizeService, 'checkClientName')
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve(), 0)
          })
      )

    const synchronizeDeviceSpy = jest
      .spyOn(SynchronizeService, 'synchronizeDevice')
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve(), 0)
          })
      )

    const synchronizeOnInitPromise =
      SynchronizeService.synchronizeOnInit(client)

    await synchronizeOnInitPromise

    const checkClientNameOrder = checkClientNameSpy.mock.invocationCallOrder[0]
    const synchronizeDeviceOrder =
      synchronizeDeviceSpy.mock.invocationCallOrder[0]

    expect(checkClientNameSpy).toHaveBeenCalledTimes(1)
    expect(synchronizeDeviceSpy).toHaveBeenCalledTimes(1)
    expect(checkClientNameOrder).toBeLessThan(synchronizeDeviceOrder)

    checkClientNameSpy.mockRestore()
    synchronizeDeviceSpy.mockRestore()
  })

  it('should call synchronizeDevice even when checkClientName throws in synchronizeOnInit', async () => {
    const mockError = new Error('update failed')

    client.getStackClient = jest.fn().mockReturnValue({
      oauthOptions: { clientName: 'wrongName' },
      updateInformation: jest.fn().mockRejectedValueOnce(mockError)
    })

    const spy = jest
      .spyOn(SynchronizeService, 'synchronizeDevice')
      .mockImplementation(() => Promise.resolve())

    await synchronizeOnInit(client)

    expect(spy).toBeCalledWith(client)
    spy.mockRestore()
  })
})
