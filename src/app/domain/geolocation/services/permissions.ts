import { Platform } from 'react-native'

import {
  checkNativePermission,
  requestNativePermission,
  NATIVE_PERMISSIONS,
  NativePermissionStatus
} from '/app/domain/nativePermissions'
import { t } from '/locales/i18n'

export const checkLocationPermissions =
  async (): Promise<NativePermissionStatus> => {
    if (Platform.OS === 'ios') {
      const locationAlwaysPermission = await checkNativePermission(
        NATIVE_PERMISSIONS.IOS.LOCATION_ALWAYS
      )
      const motionPermission = await checkNativePermission(
        NATIVE_PERMISSIONS.IOS.MOTION
      )

      return {
        granted: locationAlwaysPermission.granted && motionPermission.granted,
        canRequest:
          locationAlwaysPermission.canRequest && motionPermission.canRequest
      }
    }

    if (Platform.OS === 'android' && Platform.Version >= 29) {
      const fineLocationPermission = await checkNativePermission(
        NATIVE_PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      )
      const activityRecognitionPermission = await checkNativePermission(
        NATIVE_PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION
      )

      return {
        granted:
          fineLocationPermission.granted &&
          activityRecognitionPermission.granted,
        canRequest:
          fineLocationPermission.canRequest &&
          activityRecognitionPermission.canRequest
      }
    }

    if (Platform.OS === 'android' && Platform.Version < 29) {
      const fineLocationPermission = await checkNativePermission(
        NATIVE_PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      )

      return {
        granted: fineLocationPermission.granted,
        canRequest: fineLocationPermission.canRequest
      }
    }

    throw new Error(t('services.backup.errors.platformNotSupported'))
  }

export const requestLocationPermissions =
  async (): Promise<NativePermissionStatus> => {
    if (Platform.OS === 'ios') {
      const locationAlwaysPermission = await requestNativePermission(
        NATIVE_PERMISSIONS.IOS.LOCATION_ALWAYS
      )
      const motionPermission = await requestNativePermission(
        NATIVE_PERMISSIONS.IOS.MOTION
      )

      return {
        granted: locationAlwaysPermission.granted && motionPermission.granted,
        canRequest:
          locationAlwaysPermission.canRequest && motionPermission.canRequest
      }
    }

    if (Platform.OS === 'android' && Platform.Version >= 29) {
      const fineLocationPermission = await requestNativePermission(
        NATIVE_PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      )
      const activityRecognitionPermission = await requestNativePermission(
        NATIVE_PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION
      )

      return {
        granted:
          fineLocationPermission.granted &&
          activityRecognitionPermission.granted,
        canRequest:
          fineLocationPermission.canRequest &&
          activityRecognitionPermission.canRequest
      }
    }

    if (Platform.OS === 'android' && Platform.Version < 29) {
      const fineLocationPermission = await requestNativePermission(
        NATIVE_PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      )

      return {
        granted: fineLocationPermission.granted,
        canRequest: fineLocationPermission.canRequest
      }
    }

    throw new Error(t('errors.platformNotSupported'))
  }
