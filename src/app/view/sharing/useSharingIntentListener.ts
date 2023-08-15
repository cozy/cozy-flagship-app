import { useEffect, useState } from 'react'
import { DeviceEventEmitter, NativeModules } from 'react-native'

import { SharingIntentStatus } from '/app/domain/sharing/models/ReceivedIntent'
import { sharingLogger } from '/app/domain/sharing/services/SharingService'

export const useSharingIntentListener = (): {
  sharingIntentStatus: SharingIntentStatus
} => {
  const [status, setStatus] = useState<SharingIntentStatus>(
    SharingIntentStatus.Undetermined
  )

  useEffect(() => {
    const nativeModule = NativeModules as {
      SharingIntentModule: { wasAppOpenedViaSharing: () => Promise<boolean> }
    }

    const handleSharingIntent = (isSharing: boolean): void => {
      const newStatus = isSharing
        ? SharingIntentStatus.OpenedViaSharing
        : SharingIntentStatus.NotOpenedViaSharing

      sharingLogger.info(
        `App was ${
          isSharing ? 'opened' : 'resumed'
        } via sharing, setting status to ${newStatus}`
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

    return () => {
      onOpen.remove()
      onResume.remove()
    }
  }, [])

  return { sharingIntentStatus: status }
}
