import { useEffect } from 'react'
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

  const initialDimensions = {
    navbarHeight: initialWindowMetrics?.insets.bottom ?? 0,
    screenHeight: screenHeight,
    screenWidth: screenWidth,
    statusBarHeight: initialWindowMetrics?.insets.top ?? 0
  }

  return initialDimensions
}

export const setDimensions = (dimensions: DeviceDimensions): void => {
  dimensionsHook = dimensions
}

export { useDimensions, getDimensions }
