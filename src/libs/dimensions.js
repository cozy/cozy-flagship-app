import { Dimensions, Platform } from 'react-native'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import { getNavigationBarHeight } from 'react-native-android-navbar-height'
import Minilog from '@cozy/minilog'

let navbarHeight = 0

const getNavbarHeight = () => navbarHeight
const statusBarHeight = getStatusBarHeight()
const {
  scale,
  height: screenHeight,
  width: screenWidth
} = Dimensions.get('screen')

const init = async () => {
  try {
    if (Platform.OS !== 'android') return
    navbarHeight = (await getNavigationBarHeight()) / scale
  } catch (error) {
    Minilog('libs/dimensions').warn(
      `Failed to compute NavbarHeight, keeping default value: ${navbarHeight}. Please refer to the error below.\n`,
      error
    )
  }
}

init()

export { getNavbarHeight, screenHeight, screenWidth, statusBarHeight }
