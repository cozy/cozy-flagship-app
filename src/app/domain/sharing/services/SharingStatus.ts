import {
  NativeModules,
  DeviceEventEmitter,
  Linking,
  Platform
} from 'react-native'

import { SharingIntentStatus } from '/app/domain/sharing/models/SharingState'
import { sharingLogger } from '/app/domain/sharing'

export const handleSharing = (
  setStatus: (status: SharingIntentStatus) => void
): (() => void) => {
  const nativeModule = NativeModules as {
    SharingIntentModule?: { wasAppOpenedViaSharing: () => Promise<boolean> }
  }

  const handleSharingIntent = (event: { url: string } | boolean): void => {
    let isSharing = false
    const isAndroid = typeof event === 'boolean'

    if (isAndroid) {
      isSharing = event
    } else if (event.url) {
      isSharing = true
    }

    const newStatus = isSharing
      ? SharingIntentStatus.OpenedViaSharing
      : SharingIntentStatus.NotOpenedViaSharing

    sharingLogger.info(
      `${
        isAndroid ? 'Android' : 'iOS'
      } App was opened or resumed via sharing, setting status to ${newStatus}`
    )

    setStatus(newStatus)
  }

  nativeModule.SharingIntentModule?.wasAppOpenedViaSharing()
    .then(handleSharingIntent)
    .catch(error => {
      sharingLogger.error(
        'Failed to check if app was opened via sharing',
        error
      )
    })

  const onOpen =
    Platform.OS === 'android' &&
    DeviceEventEmitter.addListener(
      'APP_OPENED_VIA_SHARING',
      handleSharingIntent
    )

  const onResume =
    Platform.OS === 'android' &&
    DeviceEventEmitter.addListener(
      'APP_RESUMED_WITH_SHARING',
      handleSharingIntent
    )

  const handleLinkingEvent = (event: { url: string }): void => {
    handleSharingIntent(event)
  }

  const iOSonOpenResume =
    Platform.OS === 'ios' && Linking.addEventListener('url', handleLinkingEvent)

  return (): void => {
    typeof onOpen !== 'boolean' && onOpen.remove()
    typeof onResume !== 'boolean' && onResume.remove()
    typeof iOSonOpenResume !== 'boolean' && iOSonOpenResume.remove()
  }
}
