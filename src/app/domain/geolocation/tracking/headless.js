import { handleMotionChange, handleConnectivityChange } from './index'
import { Log } from '../helpers'

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
      Log('[ACTIVITYCHANGE] -' + JSON.stringify(params))
      break
    case 'connectivitychange':
      await handleConnectivityChange(params)
      break
    default:
      break
  }
}
