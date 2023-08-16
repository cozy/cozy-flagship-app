import { NativeModules, DeviceEventEmitter, Linking } from 'react-native'

import { sharingLogger } from './SharingService'
import { SharingIntentStatus } from '../models/ReceivedIntent'

export const handleAndroidSharing = (
  setStatus: (status: SharingIntentStatus) => void
): (() => void) => {
  const nativeModule = NativeModules as {
    SharingIntentModule: { wasAppOpenedViaSharing: () => Promise<boolean> }
  }

  const handleSharingIntent = (isSharing: boolean): void => {
    const newStatus = isSharing
      ? SharingIntentStatus.OpenedViaSharing
      : SharingIntentStatus.NotOpenedViaSharing

    sharingLogger.info(
      `App was opened or resumed via sharing, setting status to ${newStatus}`
    )

    setStatus(newStatus)
  }

  nativeModule.SharingIntentModule.wasAppOpenedViaSharing()
    .then(handleSharingIntent)
    .catch(error => {
      sharingLogger.error(
        'Failed to check if app was opened via sharing',
        error
      )
    })

  const onOpen = DeviceEventEmitter.addListener(
    'APP_OPENED_VIA_SHARING',
    handleSharingIntent
  )
  const onResume = DeviceEventEmitter.addListener(
    'APP_RESUMED_WITH_SHARING',
    handleSharingIntent
  )

  return (): void => {
    onOpen.remove()
    onResume.remove()
  }
}

export const handleIOSSharing = (
  setStatus: (status: SharingIntentStatus) => void
): (() => void) => {
  const handleIOSIntent = (url: string | null): void => {
    if (url) {
      setStatus(SharingIntentStatus.OpenedViaSharing)
    } else {
      setStatus(SharingIntentStatus.NotOpenedViaSharing)
    }
  }

  Linking.getInitialURL()
    .then(handleIOSIntent)
    .catch(error => {
      sharingLogger.error('Failed to get initial URL on iOS', error)
    })

  const subscription = Linking.addEventListener('url', ({ url }) =>
    handleIOSIntent(url)
  )

  return () => {
    subscription.remove()
  }
}
