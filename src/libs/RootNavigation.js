import {
  createNavigationContainerRef,
  CommonActions
} from '@react-navigation/native'

import Minilog from 'cozy-minilog'

const log = Minilog('RootNavigation')

export const navigationRef = createNavigationContainerRef()

const isReady = () => navigationRef.isReady()

export const goBack = () => navigationRef.goBack()

export const navigate = (name, params) => {
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

export const reset = (name, params = {}) => {
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
