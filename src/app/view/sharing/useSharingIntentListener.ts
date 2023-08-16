import { useEffect, useState } from 'react'
import {
  DeviceEventEmitter,
  NativeModules,
  Platform,
  Linking
} from 'react-native'

import { SharingIntentStatus } from '/app/domain/sharing/models/ReceivedIntent'
import { sharingLogger } from '/app/domain/sharing/services/SharingService'

export const useSharingIntentListener = (): {
  sharingIntentStatus: SharingIntentStatus
} => {
  const [status, setStatus] = useState<SharingIntentStatus>(
    SharingIntentStatus.Undetermined
  )

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Your Android specific logic
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
    } else if (Platform.OS === 'ios') {
      // iOS specific logic
      const handleIOSIntent = (url: string | null): void => {
        sharingLogger.error('ios', url)
        if (url) {
          // Here, check if the URL is related to sharing.
          // If so, update the status.
          setStatus(SharingIntentStatus.OpenedViaSharing)
        } else {
          setStatus(SharingIntentStatus.NotOpenedViaSharing)
        }
      }

      // Get the initial URL
      Linking.getInitialURL()
        .then(handleIOSIntent)
        .catch(error => {
          sharingLogger.error('Failed to get initial URL on iOS', error)
        })

      // Listen for URL changes
      const onChange = ({ url }: { url: string }): void => handleIOSIntent(url)

      const subscription = Linking.addEventListener('url', onChange)

      return () => {
        // Cleanup
        subscription.remove()
      }
    }
  }, [])

  return { sharingIntentStatus: status }
}
