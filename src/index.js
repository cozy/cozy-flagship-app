import { AppRegistry } from 'react-native'

import App from '/App'
import { name as appName } from '/app.json'
import { ShareComponent } from '/app/view/Share/ShareComponent'
import { SHARE_APP_NAME as shareAppName } from '/constants/strings.json'

AppRegistry.registerComponent(appName, () => App)
AppRegistry.registerComponent(shareAppName, () => ShareComponent)
