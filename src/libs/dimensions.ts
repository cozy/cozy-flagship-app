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

  console.log('🌈🌈🌈🌈🌈')
  console.log('USE DIMENSION', {
    navbarHeight: insets.bottom,
    screenHeight: frame.height,
    screenWidth: frame.width,
    statusBarHeight: insets.top
  })
  console.log('🌈🌈🌈🌈🌈')

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
    console.log('🟣🟣🟣🟣🟣')
    console.log('GET DIMENSION returns initial', dimensionsHook)
    console.log('🟣🟣🟣🟣🟣')
    
    return dimensionsHook
  }

  const initialDimensions = {
    navbarHeight: initialWindowMetrics?.insets.bottom ?? 0,
    screenHeight: screenHeight,
    screenWidth: screenWidth,
    statusBarHeight: initialWindowMetrics?.insets.top ?? 0
  }

  if (initialDimensions.navbarHeight === 0) {
    console.log('🔴🔴🔴🔴🔴')
    console.log('PROBLEM')
    console.log('🔴🔴🔴🔴🔴')
  }

  console.log('🟢🟢🟢🟢🟢')
  console.log('GET DIMENSION returns initial', initialDimensions)
  console.log('🟢🟢🟢🟢🟢')

  return initialDimensions
}

export const setDimensions = (dimensions: DeviceDimensions): void => {
  console.log('🟡🟡🟡🟡🟡')
  console.log('setDimensions update dimensionsHook', dimensions)
  console.log('🟡🟡🟡🟡🟡')

  dimensionsHook = dimensions
}

export { useDimensions, getDimensions }
