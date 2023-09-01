import {
  check,
  request,
  checkNotifications as RNPCheckNotifications,
  requestNotifications as RNPRequestNotifications,
  PermissionStatus,
  RESULTS
} from 'react-native-permissions'

import { NativePermission, NativePermissionStatus } from '../models'

export const checkNativePermission = async (
  permission: NativePermission
): Promise<NativePermissionStatus> => {
  const result = await check(permission)

  return formatResult(result)
}

export const requestNativePermission = async (
  permission: NativePermission
): Promise<NativePermissionStatus> => {
  const result = await request(permission)

  return formatResult(result)
}

export const checkNotifications = async (): Promise<NativePermissionStatus> => {
  const result = await RNPCheckNotifications()

  return formatResult(result.status)
}

export const requestNotifications =
  async (): Promise<NativePermissionStatus> => {
    const result = await RNPRequestNotifications(['alert'])

    return formatResult(result.status)
  }

const formatResult = (result: PermissionStatus): NativePermissionStatus => {
  switch (result) {
    case RESULTS.UNAVAILABLE:
      throw new Error('Native permission unavailable')
    case RESULTS.DENIED:
      return {
        granted: false,
        canRequest: true
      }
    // Android will never return blocked after a check, you have to request the permission to get the info
    case RESULTS.BLOCKED:
      return {
        granted: false,
        canRequest: false
      }
    case RESULTS.LIMITED:
      return {
        granted: true,
        canRequest: false
      }
    case RESULTS.GRANTED:
      return {
        granted: true,
        canRequest: false
      }
  }
}
