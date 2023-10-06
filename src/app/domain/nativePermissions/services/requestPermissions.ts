import { requestLocationPermissions } from '/app/domain/geolocation/services/permissions'
import { NativePermissionStatus } from '/app/domain/nativePermissions'

export const requestPermissions = async (
  featureName: string
): Promise<NativePermissionStatus> => {
  if (featureName === 'geolocationTracking') {
    return await requestLocationPermissions()
  }

  throw new Error('Feature not available')
}
