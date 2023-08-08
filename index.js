import { AppRegistry } from 'react-native'
import 'react-native-gesture-handler'
import 'react-native-url-polyfill/auto'

import App from './src/App'
import { ShareComponent } from './src/app/view/Share/ShareComponent'
import { name as appName } from './src/app.json'
import { SHARE_APP_NAME as shareAppName } from './src/constants/strings.json'

AppRegistry.registerComponent(appName, () => App)
AppRegistry.registerComponent(shareAppName, () => ShareComponent)
