import { Log } from '/app/domain/geolocation/helpers'
import {
  handleMotionChange,
  handleConnectivityChange,
  handleActivityChange
} from '/app/domain/geolocation/tracking'

export const GeolocationTrackingHeadlessTask = async event => {
  const params = event.params
  Log('headless event name: ' + event.name)

  switch (event.name) {
    case 'location':
      Log('[LOCATION] -' + JSON.stringify(params))
      break
    case 'motionchange':
      await handleMotionChange(params)
      break
    case 'activitychange':
      await handleActivityChange(params)
      break
    case 'connectivitychange':
      await handleConnectivityChange(params)
      break
    default:
      break
  }
}
