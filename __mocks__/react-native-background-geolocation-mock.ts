import RNBackgroundGeolocation from 'react-native-background-geolocation'

/*
File generated mostly thanks to this bash command except for the logger object

cat node_modules/react-native-background-geolocation/src/declarations/BackgroundGeolocation.d.ts|grep -o 'static [[:alnum:]_]*' |sed 's/static //' |sed 's/$/: jest.fn(),/'
*/

// @ts-expect-error Mock is enough as is
export const mockRNBackgroundGeolocation: jest.Mocked<
  typeof RNBackgroundGeolocation
> = {
  logger: {
    destroyLog: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    notice: jest.fn(),
    getLog: jest.fn(),
    emailLog: jest.fn(),
    uploadLog: jest.fn(),
    ORDER_DESC: 1,
    ORDER_ASC: 1
  },
  addListener: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  un: jest.fn(),
  removeListeners: jest.fn(),
  removeAllListeners: jest.fn(),
  onLocation: jest.fn(),
  onGeofence: jest.fn(),
  onMotionChange: jest.fn(),
  onHttp: jest.fn(),
  onActivityChange: jest.fn(),
  onProviderChange: jest.fn(),
  onHeartbeat: jest.fn(),
  onGeofencesChange: jest.fn(),
  onSchedule: jest.fn(),
  onConnectivityChange: jest.fn(),
  onPowerSaveChange: jest.fn(),
  onEnabledChange: jest.fn(),
  onNotificationAction: jest.fn(),
  onAuthorization: jest.fn(),
  registerHeadlessTask: jest.fn(),
  ready: jest.fn(),
  configure: jest.fn(),
  setConfig: jest.fn(),
  reset: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  changePace: jest.fn(),
  startGeofences: jest.fn(),
  getState: jest.fn(),
  startSchedule: jest.fn(),
  stopSchedule: jest.fn(),
  startBackgroundTask: jest.fn(),
  stopBackgroundTask: jest.fn(),
  finish: jest.fn(),
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  stopWatchPosition: jest.fn(),
  getLocations: jest.fn(),
  getCount: jest.fn(),
  destroyLocations: jest.fn(),
  destroyLocation: jest.fn(),
  insertLocation: jest.fn(),
  sync: jest.fn(),
  getOdometer: jest.fn(),
  setOdometer: jest.fn(),
  resetOdometer: jest.fn(),
  addGeofence: jest.fn(),
  addGeofences: jest.fn(),
  removeGeofence: jest.fn(),
  removeGeofences: jest.fn(),
  getGeofences: jest.fn(),
  getGeofence: jest.fn(),
  geofenceExists: jest.fn(),
  setLogLevel: jest.fn(),
  getLog: jest.fn(),
  emailLog: jest.fn(),
  destroyLog: jest.fn(),
  isPowerSaveMode: jest.fn(),
  getSensors: jest.fn(),
  getDeviceInfo: jest.fn(),
  getProviderState: jest.fn(),
  requestPermission: jest.fn(),
  requestTemporaryFullAccuracy: jest.fn(),
  playSound: jest.fn(),
  transistorTrackerParams: jest.fn(),
  findOrCreateTransistorAuthorizationToken: jest.fn(),
  destroyTransistorAuthorizationToken: jest.fn()
}
