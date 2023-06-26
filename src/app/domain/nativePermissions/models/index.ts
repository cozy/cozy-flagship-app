import { PERMISSIONS } from 'react-native-permissions'

/*
  If you want to add a new permission, add it :
  - here
  - for iOS in package.json and Info.plist
  - for android in AndroidManifest.xml

  And then yarn install

  Source : https://github.com/zoontek/react-native-permissions#setup
*/

const IOS = Object.freeze({
  PHOTO_LIBRARY: PERMISSIONS.IOS.PHOTO_LIBRARY
})

const ANDROID = Object.freeze({
  READ_EXTERNAL_STORAGE: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  READ_MEDIA_IMAGES: PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
  READ_MEDIA_VIDEO: PERMISSIONS.ANDROID.READ_MEDIA_VIDEO
})

export const NATIVE_PERMISSIONS = Object.freeze({
  ANDROID,
  IOS
})

type Values<T extends object> = T[keyof T]

type IOSNativePermissionMap = typeof IOS
type IOSPermission = Values<IOSNativePermissionMap>

type AndroidNativePermissionMap = typeof ANDROID
type AndroidPermission = Values<AndroidNativePermissionMap>

export type NativePermission = IOSPermission | AndroidPermission

export interface NativePermissionStatus {
  granted: boolean
  canRequest: boolean
}
