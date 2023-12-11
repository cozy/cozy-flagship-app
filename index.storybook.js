import { getStorybookUI } from '@storybook/react-native'
import { AppRegistry } from 'react-native'
import RNBootSplash from 'react-native-bootsplash'

import './.storybook/storybook.requires'
import { name as appName } from './src/app.json'

const StorybookUIRoot = getStorybookUI({})

AppRegistry.registerComponent(appName, () => StorybookUIRoot)

RNBootSplash.hide({ fade: true }) // Have to manually hide the splash screen for now. Might cause issues when hot reloading.
