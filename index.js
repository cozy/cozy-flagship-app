import { AppRegistry } from 'react-native'
import 'react-native-gesture-handler'
import 'react-native-url-polyfill/auto'

import App from './src/App'
import { name as appName } from './src/app.json'

AppRegistry.registerComponent(appName, () => App)
