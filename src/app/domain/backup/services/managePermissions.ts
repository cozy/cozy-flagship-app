import { Platform } from 'react-native'

import {
  checkNativePermission,
  requestNativePermission,
  NATIVE_PERMISSIONS,
  NativePermissionStatus
} from '/app/domain/nativePermissions'

export const checkBackupPermissions =
  async (): Promise<NativePermissionStatus> => {
    if (Platform.OS === 'ios') {
      return await checkNativePermission(NATIVE_PERMISSIONS.IOS.PHOTO_LIBRARY)
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const imagePermission = await checkNativePermission(
        NATIVE_PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      )
      const videoPermission = await checkNativePermission(
        NATIVE_PERMISSIONS.ANDROID.READ_MEDIA_VIDEO
      )

      return {
        granted: imagePermission.granted && videoPermission.granted,
        canRequest: imagePermission.canRequest && videoPermission.canRequest
      }
    }

    if (Platform.OS === 'android' && Platform.Version < 33) {
      return await checkNativePermission(
        NATIVE_PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
      )
    }

    throw new Error('Platform is not supported for backup')
  }

export const requestBackupPermissions =
  async (): Promise<NativePermissionStatus> => {
    if (Platform.OS === 'ios') {
      return await requestNativePermission(NATIVE_PERMISSIONS.IOS.PHOTO_LIBRARY)
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const imagePermission = await requestNativePermission(
        NATIVE_PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      )
      const videoPermission = await requestNativePermission(
        NATIVE_PERMISSIONS.ANDROID.READ_MEDIA_VIDEO
      )

      return {
        granted: imagePermission.granted && videoPermission.granted,
        canRequest: imagePermission.canRequest && videoPermission.canRequest
      }
    }

    if (Platform.OS === 'android' && Platform.Version < 33) {
      return await requestNativePermission(
        NATIVE_PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
      )
    }

    throw new Error('Platform is not supported for backup')
  }
