import { AppRegistry } from 'react-native'
import BackgroundGeolocation from 'react-native-background-geolocation'
import 'react-native-gesture-handler'
import 'react-native-url-polyfill/auto'

import { GeolocationTrackingHeadlessTask } from './CozyGPSMemory/geolocation/services'
import App from './src/App'
import { name as appName } from './src/app.json'

AppRegistry.registerComponent(appName, () => App)

BackgroundGeolocation.registerHeadlessTask(GeolocationTrackingHeadlessTask)
