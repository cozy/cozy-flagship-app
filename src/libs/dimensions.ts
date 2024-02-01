import { useEffect } from 'react'
import { Dimensions, Platform } from 'react-native'
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

  useEffect(() => {
    setDimensions({
      navbarHeight: insets.bottom,
      screenHeight: frame.height,
      screenWidth: frame.width,
      statusBarHeight: insets.top
    })
  }, [insets, frame])

  return {
    navbarHeight: insets.bottom,
    screenHeight: frame.height,
    screenWidth: frame.width,
    statusBarHeight: insets.top
  }
}

let dimensionsHook: DeviceDimensions | undefined = undefined

/**
 * Get device's dimensions (screen, navigationBar and statusBar sizes)
 * @returns device's dimensions
 */
const getDimensions = (): DeviceDimensions => {
  if (dimensionsHook) {
    return dimensionsHook
  }

  const navbarHeight = initialWindowMetrics?.insets.bottom ?? 0
  const statusBarHeight = initialWindowMetrics?.insets.top ?? 0

  // Case when the initial call has no dimensions available on Android
  // We use statusBarHeight as hint because navbar can be legitimately 0
  if (statusBarHeight === 0 && Platform.OS === 'android') {
    // In that case, we return the official dimensions, so the user never has a 0 height navbar/statusbar
    return {
      navbarHeight: 24, // Official height is 24dp, as is stated on Android Design webpage,
      screenHeight: screenHeight,
      screenWidth: screenWidth,
      statusBarHeight: 48 // Official height is 48dp, as is stated on Android Design webpage
    }
  }

  const initialDimensions = {
    navbarHeight,
    screenHeight: screenHeight,
    screenWidth: screenWidth,
    statusBarHeight
  }

  return initialDimensions
}

export const setDimensions = (dimensions: DeviceDimensions): void => {
  dimensionsHook = dimensions
}

export { useDimensions, getDimensions }
