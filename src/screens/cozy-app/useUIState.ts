import { RouteProp } from '@react-navigation/native'
import { useEffect, useState } from 'react'

import { internalMethods } from '/libs/intents/localMethods'
import { flagshipUI } from '/libs/intents/setFlagshipUI'

interface UIStateType {
  bottomBackground?: string
  bottomTheme?: string
  bottomOverlay?: string
  topBackground?: string
  topTheme?: string
  topOverlay?: string
}

interface ReturnType {
  UIState: UIStateType
  isFirstHalf: boolean
  isReady: boolean
  setFirstHalf: React.Dispatch<React.SetStateAction<boolean>>
  setReady: React.Dispatch<React.SetStateAction<boolean>>
  shouldExitAnimation: boolean
  setShouldExitAnimation: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * Hook for managing the UI state of the CozyAppScreen component.
 * @param {RouteProps} route - The route object with the required parameters for the hook.
 * @returns {{
 *   UIState: UIState,
 *   isFirstHalf: boolean,
 *   isReady: boolean,
 *   onLoadEnd: () => void,
 * }} An object containing the current UI state, isFirstHalf state, isReady state, and onLoadEnd callback.
 */
const useUIState = (
  route: RouteProp<Record<string, object | undefined>, string>
): ReturnType => {
  const [UIState, setUIState] = useState<UIStateType>({})
  const [isFirstHalf, setFirstHalf] = useState<boolean>(false)
  const [isReady, setReady] = useState<boolean>(false)
  const [shouldExitAnimation, setShouldExitAnimation] = useState<boolean>(false)

  const firstHalfUI = (): void => {
    internalMethods.setFlagshipUI({
      bottomBackground: 'white',
      bottomTheme: 'dark',
      bottomOverlay: 'transparent',
      topBackground: 'white',
      topTheme: 'dark',
      topOverlay: 'transparent'
    })
  }

  useEffect(() => {
    const handleFlagshipUIChange = (state: Partial<UIState>) => {
      setUIState(prevState => ({ ...prevState, ...state }))
    }

    flagshipUI.on('change', handleFlagshipUIChange)

    return () => {
      flagshipUI.off('change', handleFlagshipUIChange)
    }
  }, [route])

  useEffect(() => {
    if (isReady) return

    !route.params.iconParams && setReady(true)

    isFirstHalf && firstHalfUI()
  }, [isFirstHalf, isReady, route.params.iconParams])

  return {
    UIState,
    isFirstHalf,
    isReady,
    setFirstHalf,
    setReady,
    shouldExitAnimation,
    setShouldExitAnimation
  }
}

export default useUIState
