import { Dimensions } from 'react-native'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import { getNavigationBarHeight } from 'react-native-android-navbar-height'
import Minilog from '@cozy/minilog'

const getNavbarHeight = () => navbarHeight
let navbarHeight = 0

try {
  ;(async () => {
    navbarHeight =
      (await getNavigationBarHeight()) / Dimensions.get('screen').scale
  })()
} catch (error) {
  Minilog('dimensions.js').error(
    'Failed to compute NavbarHeight, defaulting to 0',
    error
  )
}

const screenHeight = Dimensions.get('screen').height
const screenWidth = Dimensions.get('screen').width
const statusBarHeight = getStatusBarHeight()

export { getNavbarHeight, screenHeight, screenWidth, statusBarHeight }
