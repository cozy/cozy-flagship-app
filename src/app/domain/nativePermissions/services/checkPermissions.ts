import { checkLocationPermissions } from '/app/domain/geolocation/services/permissions'
import { NativePermissionStatus } from '/app/domain/nativePermissions'

export const checkPermissions = async (
  featureName: string
): Promise<NativePermissionStatus> => {
  if (featureName === 'geolocationTracking') {
    return checkLocationPermissions()
  }

  throw new Error('Feature not available')
}
