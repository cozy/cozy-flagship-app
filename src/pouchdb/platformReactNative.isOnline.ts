import NetInfo from '@react-native-community/netinfo'

import { NetService } from '/libs/services/NetService'

let currentState: boolean | undefined = undefined

export const isOnline = async (): Promise<boolean> => {
  if (currentState === undefined) {
    currentState = (await NetService.isConnected()) ?? true
    NetInfo.addEventListener(state => {
      currentState = state.isConnected ?? true
    })
  }
  return currentState
}
