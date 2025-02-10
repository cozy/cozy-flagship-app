import { AppRegistry } from 'react-native'
import BackgroundGeolocation from 'react-native-background-geolocation'
import 'react-native-gesture-handler'
import 'react-native-url-polyfill/auto'
import 'text-encoding-polyfill'

import App from './src/App'
import { GeolocationTrackingHeadlessTask } from './src/app/domain/geolocation/tracking'
import { name as appName } from './src/app.json'

AppRegistry.registerComponent(appName, () => App)

BackgroundGeolocation.registerHeadlessTask(GeolocationTrackingHeadlessTask)
