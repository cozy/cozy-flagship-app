import { Dimensions } from 'react-native'
import {
  initialWindowMetrics,
  useSafeAreaFrame,
  useSafeAreaInsets
} from 'react-native-safe-area-context'

interface DeviceDimensions {
  navbarHeight: number
  screenHeight: number
  screenWidth: number
  statusBarHeight: number
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('screen')

/**
 * React Hook that returns device's dimensions (screen, navigationBar and statusBar sizes)
 * @returns device's dimensions
 */
const useDimensions = (): DeviceDimensions => {
  const insets = useSafeAreaInsets()
  const frame = useSafeAreaFrame()

  return {
    navbarHeight: insets.bottom,
    screenHeight: frame.height,
    screenWidth: frame.width,
    statusBarHeight: insets.top
  }
}

/**
 * Get device's dimensions (screen, navigationBar and statusBar sizes)
 * @returns device's dimensions
 */
const getDimensions = (): DeviceDimensions => {
  return {
    navbarHeight: initialWindowMetrics?.insets.bottom ?? 0,
    screenHeight: screenHeight,
    screenWidth: screenWidth,
    statusBarHeight: initialWindowMetrics?.insets.top ?? 0
  }
}

export { useDimensions, getDimensions }
