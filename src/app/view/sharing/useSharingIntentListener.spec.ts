/* eslint-disable @typescript-eslint/unbound-method */
import { renderHook, act } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react-native'
import { DeviceEventEmitter, NativeModules } from 'react-native'

import { useSharingIntentListener } from '/app/view/sharing/useSharingIntentListener'
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
    }
  }
})

jest.mock('/app/domain/sharing/services/SharingService', () => ({
  sharingLogger: {
    info: jest.fn(),
    error: jest.fn()
  }
}))

const mockAddListener = DeviceEventEmitter.addListener as jest.MockedFunction<
  (typeof DeviceEventEmitter)['addListener']
>
const mockSharingModule = NativeModules.SharingIntentModule as {
  wasAppOpenedViaSharing: jest.Mock
}

describe('useSharingIntentListener', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should initially set status to Undetermined', async () => {
    mockSharingModule.wasAppOpenedViaSharing.mockResolvedValue(true)

    const { result } = renderHook(() => useSharingIntentListener())

    await waitFor(() => {
      expect(result.current.sharingIntentStatus).toBe(
        SharingIntentStatus.Undetermined
      )
    })
  })

  it('should set status to OpenedViaSharing when app was opened via sharing', async () => {
    mockSharingModule.wasAppOpenedViaSharing.mockResolvedValue(true)

    const { result, waitForNextUpdate } = renderHook(() =>
      useSharingIntentListener()
    )

    await waitForNextUpdate()
    expect(result.current.sharingIntentStatus).toBe(
      SharingIntentStatus.OpenedViaSharing
    )
  })

  it('should set status to NotOpenedViaSharing when app was not opened via sharing', async () => {
    mockSharingModule.wasAppOpenedViaSharing.mockResolvedValue(false)

    const { result, waitForNextUpdate } = renderHook(() =>
      useSharingIntentListener()
    )

    await waitForNextUpdate()
    expect(result.current.sharingIntentStatus).toBe(
      SharingIntentStatus.NotOpenedViaSharing
    )
  })

  it('should log error when wasAppOpenedViaSharing fails', async () => {
    const error = new Error('Test error')

    mockSharingModule.wasAppOpenedViaSharing.mockRejectedValue(error)

    renderHook(() => useSharingIntentListener())

    await waitFor(() => {
      expect(sharingLogger.error).toHaveBeenCalledWith(
        'Failed to check if app was opened via sharing',
        error
      )
    })
  })

  it('should handle APP_OPENED_VIA_SHARING event', () => {
    const { rerender } = renderHook(() => useSharingIntentListener())
    const callback = mockAddListener.mock.calls[0][1]

    act(() => callback(true))

    rerender()

    expect(sharingLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('App was opened via sharing')
    )
  })

  it('should handle APP_RESUMED_WITH_SHARING event', () => {
    const { rerender } = renderHook(() => useSharingIntentListener())
    const callback = mockAddListener.mock.calls[1][1]

    act(() => callback(true))

    rerender()

    expect(sharingLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('App was opened via sharing')
    )
  })
})
