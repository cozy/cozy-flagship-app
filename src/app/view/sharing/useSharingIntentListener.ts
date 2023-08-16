import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

import { SharingIntentStatus } from '/app/domain/sharing/models/ReceivedIntent'
import {
  handleAndroidSharing,
  handleIOSSharing
} from '/app/domain/sharing/services/SharingHandlers'

export const useSharingIntentListener = (): {
  sharingIntentStatus: SharingIntentStatus
} => {
  const [status, setStatus] = useState<SharingIntentStatus>(
    SharingIntentStatus.Undetermined
  )

  useEffect(() => {
    if (Platform.OS === 'android') {
      return handleAndroidSharing(setStatus)
    } else if (Platform.OS === 'ios') {
      return handleIOSSharing(setStatus)
    }
  }, [])

  return { sharingIntentStatus: status }
}
