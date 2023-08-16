/* eslint-disable @typescript-eslint/unbound-method */

import { DeviceEventEmitter, Linking, NativeModules } from 'react-native'

import {
  handleAndroidSharing,
  handleIOSSharing
} from '/app/domain/sharing/services/SharingHandlers'
import { SharingIntentStatus } from '/app/domain/sharing/models/ReceivedIntent'
import { sharingLogger } from '/app/domain/sharing/services/SharingService'

jest.mock('react-native', () => {
  return {
    DeviceEventEmitter: {
      addListener: jest.fn()
    },
    NativeModules: {
      SharingIntentModule: {
        wasAppOpenedViaSharing: jest.fn()
      }
    },
    Linking: {
      getInitialURL: jest.fn(),
      addEventListener: jest.fn()
    }
  }
})

jest.mock('/app/domain/sharing/services/SharingService', () => ({
  sharingLogger: {
    info: jest.fn(),
    error: jest.fn()
  }
}))

const mockGetInitialURL = Linking.getInitialURL as jest.MockedFunction<
  (typeof Linking)['getInitialURL']
>
const mockAddListener = DeviceEventEmitter.addListener as jest.MockedFunction<
  (typeof DeviceEventEmitter)['addListener']
>
const mockSharingModule = NativeModules.SharingIntentModule as {
  wasAppOpenedViaSharing: jest.Mock
}

describe('handleAndroidSharing', () => {
  let setStatusMock: jest.Mock

  beforeEach(() => {
    setStatusMock = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set status to OpenedViaSharing when app was opened via sharing', async () => {
    mockSharingModule.wasAppOpenedViaSharing.mockResolvedValue(true)
    handleAndroidSharing(setStatusMock)
    await Promise.resolve() // Flush promise handlers

    expect(setStatusMock).toHaveBeenCalledWith(
      SharingIntentStatus.OpenedViaSharing
    )
  })

  it('should set status to NotOpenedViaSharing when app was not opened via sharing', async () => {
    mockSharingModule.wasAppOpenedViaSharing.mockResolvedValue(false)
    handleAndroidSharing(setStatusMock)
    await Promise.resolve()

    expect(setStatusMock).toHaveBeenCalledWith(
      SharingIntentStatus.NotOpenedViaSharing
    )
  })

  it('should handle APP_OPENED_VIA_SHARING event', () => {
    handleAndroidSharing(setStatusMock)
    const callback = mockAddListener.mock.calls[0][1]
    callback(true)

    expect(sharingLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('App was opened or resumed via sharing')
    )
  })

  it('should handle APP_RESUMED_WITH_SHARING event', () => {
    handleAndroidSharing(setStatusMock)
    const callback = mockAddListener.mock.calls[1][1]
    callback(true)

    expect(sharingLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('App was opened or resumed via sharing')
    )
  })
})

describe('handleIOSSharing', () => {
  let setStatusMock: jest.Mock

  beforeEach(() => {
    setStatusMock = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set status to OpenedViaSharing when app was opened via sharing URL', async () => {
    mockGetInitialURL.mockResolvedValue('sampleURL://share')
    handleIOSSharing(setStatusMock)
    await Promise.resolve() // Flush promise handlers

    expect(setStatusMock).toHaveBeenCalledWith(
      SharingIntentStatus.OpenedViaSharing
    )
  })

  it('should set status to NotOpenedViaSharing when no sharing URL is present', async () => {
    mockGetInitialURL.mockResolvedValue(null)
    handleIOSSharing(setStatusMock)
    await Promise.resolve()

    expect(setStatusMock).toHaveBeenCalledWith(
      SharingIntentStatus.NotOpenedViaSharing
    )
  })

  it('should handle a new URL event after app has launched', () => {
    const mockEventListenerCallback = jest.fn()
    ;(Linking.addEventListener as jest.Mock).mockImplementation(
      (_event, callback: ((...args: unknown[]) => void) | undefined) => {
        mockEventListenerCallback.mockImplementation(callback)
        return { remove: jest.fn() }
      }
    )

    handleIOSSharing(setStatusMock)
    mockEventListenerCallback({ url: 'sampleURL://share' })

    expect(setStatusMock).toHaveBeenCalledWith(
      SharingIntentStatus.OpenedViaSharing
    )
  })

  // You can add more tests as required, for instance, testing the remove of the event listener
})
