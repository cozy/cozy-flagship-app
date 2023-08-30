import {
  NativeModules,
  DeviceEventEmitter,
  Linking,
  Platform
} from 'react-native'

import { OsReceiveIntentStatus } from '/app/domain/sharing/models/SharingState'
import { OsReceiveLogger } from '/app/domain/sharing'

type handleOsReceiveCallback = (status: OsReceiveIntentStatus) => void
type handleOsReceiveCleanupFn = () => void

export const handleOsReceive = (
  setStatus: handleOsReceiveCallback
): handleOsReceiveCleanupFn => {
  const nativeModule = NativeModules as {
    SharingIntentModule?: { wasAppOpenedViaSharing: () => Promise<boolean> }
  }

  const handleOsReceiveIntent = (event: { url: string } | boolean): void => {
    let isOsReceive = false
    const isAndroid = typeof event === 'boolean'

    if (isAndroid) {
      isOsReceive = event
    } else if (event.url) {
      isOsReceive = true
    }

    const newStatus = isOsReceive
      ? OsReceiveIntentStatus.OpenedViaOsReceive
      : OsReceiveIntentStatus.NotOpenedViaOsReceive

    OsReceiveLogger.info(
      `App was opened or resumed via sharing, setting status to ${newStatus}`
    )

    setStatus(newStatus)
  }

  nativeModule.SharingIntentModule?.wasAppOpenedViaSharing()
    .then(handleOsReceiveIntent)
    .catch(error => {
      OsReceiveLogger.error(
        'Failed to check if app was opened via sharing',
        error
      )
    })

  const onOpen =
    Platform.OS === 'android' &&
    DeviceEventEmitter.addListener(
      'APP_OPENED_VIA_SHARING',
      handleOsReceiveIntent
    )

  const onResume =
    Platform.OS === 'android' &&
    DeviceEventEmitter.addListener(
      'APP_RESUMED_WITH_SHARING',
      handleOsReceiveIntent
    )

  const handleLinkingEvent = (event: { url: string }): void => {
    handleOsReceiveIntent(event)
  }

  const iOSonOpenResume =
    Platform.OS === 'ios' && Linking.addEventListener('url', handleLinkingEvent)

  return (): void => {
    typeof onOpen !== 'boolean' && onOpen.remove()
    typeof onResume !== 'boolean' && onResume.remove()
    typeof iOSonOpenResume !== 'boolean' && iOSonOpenResume.remove()
  }
}
