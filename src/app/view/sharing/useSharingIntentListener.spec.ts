import { renderHook } from '@testing-library/react-hooks'
import { Platform } from 'react-native'

import { useSharingIntentListener } from '/app/view/sharing/useSharingIntentListener'
import {
  handleAndroidSharing,
  handleIOSSharing
} from '/app/domain/sharing/services/SharingHandlers'

jest.mock('/app/domain/sharing/services/SharingHandlers', () => ({
  handleAndroidSharing: jest.fn(),
  handleIOSSharing: jest.fn()
}))

describe('useSharingIntentListener', () => {
  afterEach(() => {
    jest.resetModules()
    jest.restoreAllMocks()
  })

  it('should call handleAndroidSharing on Android', () => {
    Platform.OS = 'android'

    renderHook(() => useSharingIntentListener())

    expect(handleAndroidSharing).toHaveBeenCalled()
  })

  it('should call handleIOSSharing on iOS', () => {
    Platform.OS = 'ios'

    renderHook(() => useSharingIntentListener())

    expect(handleIOSSharing).toHaveBeenCalled()
  })
})
