/* eslint-disable @typescript-eslint/unbound-method */
import { waitFor } from '@testing-library/react-native'
import { NativeModules, Linking, Platform } from 'react-native'

import { handleOsReceive } from '/app/domain/osReceive/services/OsReceiveStatus'
import { OsReceiveLogger } from '/app/domain/osReceive'
import { OsReceiveIntentStatus } from '/app/domain/osReceive/models/OsReceiveState'

jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'android'
    },
    NativeModules: {
      SharingIntentModule: {
        wasAppOpenedViaSharing: jest.fn()
      }
    },
    DeviceEventEmitter: {
      addListener: jest.fn()
    },
    Linking: {
      addEventListener: jest.fn()
    }
  }
})

jest.mock('/app/domain/osReceive')

describe('OsReceiveStatus Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    NativeModules.SharingIntentModule = {
      wasAppOpenedViaSharing: jest.fn().mockResolvedValue(false)
    }
  })

  it('handles Android app opened via osReceive', async () => {
    Platform.OS = 'android'
    const mockCall = (
      NativeModules.SharingIntentModule as {
        wasAppOpenedViaSharing: jest.Mock
      }
    ).wasAppOpenedViaSharing
    mockCall.mockResolvedValue(true)

    const setStatus = jest.fn()
    handleOsReceive(setStatus)

    await waitFor(() =>
      expect(setStatus).toHaveBeenCalledWith(
        OsReceiveIntentStatus.OpenedViaOsReceive
      )
    )
  })

  it('handles Android app not opened via osReceive', async () => {
    Platform.OS = 'android'
    const mockCall = (
      NativeModules.SharingIntentModule as {
        wasAppOpenedViaSharing: jest.Mock
      }
    ).wasAppOpenedViaSharing
    mockCall.mockResolvedValue(false)

    const setStatus = jest.fn()
    handleOsReceive(setStatus)

    await waitFor(() =>
      expect(setStatus).toHaveBeenCalledWith(
        OsReceiveIntentStatus.NotOpenedViaOsReceive
      )
    )
  })

  it('handles iOS app opened via a shared link', () => {
    Platform.OS = 'ios'
    const setStatus = jest.fn()
    handleOsReceive(setStatus)

    const addEventListenerMock =
      Linking.addEventListener as jest.MockedFunction<
        typeof Linking.addEventListener
      >

    const eventHandler = addEventListenerMock.mock.calls[0][1] as (event: {
      url: string
    }) => void
    eventHandler({ url: 'some-shared-url' })

    expect(setStatus).toHaveBeenCalledWith(
      OsReceiveIntentStatus.OpenedViaOsReceive
    )
  })

  it('handles failure when checking if app was opened via osReceive', async () => {
    Platform.OS = 'android'
    const mockCall = (
      NativeModules.SharingIntentModule as {
        wasAppOpenedViaSharing: jest.Mock
      }
    ).wasAppOpenedViaSharing
    mockCall.mockRejectedValue(new Error('Test error'))

    const setStatus = jest.fn()
    handleOsReceive(setStatus)

    await waitFor(() =>
      expect(OsReceiveLogger.error).toHaveBeenCalledWith(
        'Failed to check if app was opened via osReceive',
        expect.any(Error)
      )
    )
  })
})
