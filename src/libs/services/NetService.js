import NetInfo from '@react-native-community/netinfo'

import Minilog from '@cozy/minilog'

import { reset } from '../RootNavigation'
import { routes } from '../../constants/routes'
import strings from '../../strings.json'

const log = Minilog('NetService')

export const _netInfoChangeHandler = state => {
  try {
    state.isConnected && reset(routes.stack)
  } catch (error) {
    log.debug(error)
  }
}

const makeNetWatcher = () => {
  let unsubscribe

  return (shouldUnsub = false) => {
    if (!unsubscribe) {
      log.debug('Adding NetInfo listener')
      unsubscribe = NetInfo.addEventListener(_netInfoChangeHandler)
    }

    if (shouldUnsub) {
      log.debug('Removing NetInfo listener')
      unsubscribe()
      unsubscribe = undefined
    }
  }
}

const isConnected = async () => (await NetInfo.fetch()).isConnected

const isOffline = async () => !(await NetInfo.fetch()).isConnected

const handleOffline = () =>
  reset(routes.error, { type: strings.errorScreens.offline })

const toggleNetWatcher = makeNetWatcher()

export const NetService = {
  handleOffline,
  isConnected,
  isOffline,
  toggleNetWatcher
}
