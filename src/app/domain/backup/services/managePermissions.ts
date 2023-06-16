import { Platform, PermissionsAndroid, Permission } from 'react-native'

const PLATFORM_VERSION =
  typeof Platform.Version === 'number'
    ? Platform.Version
    : parseInt(Platform.Version, 10)

const ANDROID_PERMISSION =
  PLATFORM_VERSION >= 33
    ? ('android.permission.READ_MEDIA_IMAGES' as Permission) // PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES is only available starting RN 0.70
    : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE

export const hasMediaPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const hasPermission = await PermissionsAndroid.check(ANDROID_PERMISSION)
    return hasPermission
  }

  return true
}

export const requestMediaPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const requestResult = await PermissionsAndroid.request(ANDROID_PERMISSION)
    return requestResult === PermissionsAndroid.RESULTS.GRANTED
  }

  return true
}

export const managePermissions = async (): Promise<boolean> => {
  const hasPermission = await hasMediaPermissions()

  if (hasPermission) {
    return true
  }

  const requestResult = await requestMediaPermissions()
  return requestResult
}
