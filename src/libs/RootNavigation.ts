import {
  createNavigationContainerRef,
  CommonActions,
  Route
} from '@react-navigation/native'

import Minilog from 'cozy-minilog'

const log = Minilog('RootNavigation')

export const navigationRef =
  createNavigationContainerRef<Record<string, unknown>>()

export const getCurrentRoute = (): Route<string> | null => {
  if (!navigationRef.isReady()) {
    return null
  }

  return navigationRef.getCurrentRoute() ?? null
}

export const getCurrentRouteName = (): string | null => {
  if (!navigationRef.isReady()) {
    return null
  }

  return navigationRef.getCurrentRoute()?.name ?? null
}

const isReady = (): boolean => navigationRef.isReady()

export const goBack = (): void => navigationRef.goBack()

export const navigate = (
  name: string,
  params?: Record<string, unknown>
): void => {
  try {
    if (isReady()) return navigationRef.navigate(name, params)

    const unsubscribe = navigationRef.addListener('state', () => {
      unsubscribe()
      navigationRef.navigate(name, params)
    })
  } catch (error) {
    log.error('Could not navigate', error)
  }
}

export const reset = (name: string, params = {}): void => {
  try {
    if (isReady())
      return navigationRef.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name, params }]
        })
      )

    const unsubscribe = navigationRef.addListener('state', () => {
      unsubscribe()
      navigationRef.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name, params }]
        })
      )
    })
  } catch (error) {
    log.error('Could not reset', error)
  }
}
