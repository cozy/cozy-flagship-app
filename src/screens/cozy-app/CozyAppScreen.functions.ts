import { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes'

import { styles } from './CozyAppScreen.styles'

import { routes } from '/constants/routes'
import { getDimensions } from '/libs/dimensions'
import { NetService } from '/libs/services/NetService'
import { getColors } from '/ui/colors'
import { ProgressBarProps } from '/components/Bar'

export const handleError = ({ nativeEvent }: WebViewErrorEvent): void => {
  const { code, description } = nativeEvent

  if (code === -2 && description === 'net::ERR_INTERNET_DISCONNECTED')
    NetService.handleOffline(routes.home)
}

export const config = {
  duration: 300,
  width: '44%',
  height: '44%',
  driver: true
}

// Width has to be null at start even if it's not a valid value (was set to undefined and it broke the progress bar)
// At the time of this fix we want to go back the previously working value but we have to investigate why it has to be null
export const progressBarConfig = (): ProgressBarProps => {
  const colors = getColors({ useUserColorScheme: true })

  return {
    width: null as unknown as number | undefined,
    indeterminate: true,
    unfilledColor: colors.defaultBackgroundColor,
    color: colors.primaryColor,
    borderWidth: 0,
    height: 8,
    borderRadius: 100,
    indeterminateAnimationDuration: 1500
  }
}

export const progressBarAnimConfig = {
  fadeIn: {
    toValue: 1,
    duration: 50,
    useNativeDriver: config.driver
  },
  fadeOut: {
    toValue: 0,
    duration: 50,
    useNativeDriver: config.driver
  }
}

export const containerAnimConfig = {
  fadeOut: {
    toValue: 0,
    duration: 300,
    useNativeDriver: config.driver
  }
}

export const getTranslateInput = (params: {
  x: number
  y: number
  height: number
  width: number
}): { x: number; y: number } => {
  const { screenHeight, screenWidth } = getDimensions()

  return {
    x:
      params.x -
      styles.fadingContainer.left -
      (screenWidth - params.width) * 0.5,
    y:
      params.y -
      styles.fadingContainer.top -
      (screenHeight - params.height) * 0.5
  }
}

export const getScaleInput = (params: {
  width: number
  height: number
}): { x: number; y: number } => {
  const { screenHeight, screenWidth } = getDimensions()

  return { x: params.width / screenWidth, y: params.height / screenHeight }
}
