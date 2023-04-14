import NetInfo, {
  NetInfoState,
  NetInfoStateType
} from '@react-native-community/netinfo'
import { LogBox } from 'react-native'

import { devConfig } from '/constants/dev-config'
import { hideSplashScreen } from '/libs/services/SplashScreenService'

export const initDev = async (isDev: boolean): Promise<void> => {
  if (!isDev) return

  if (hideSplashScreen) await hideSplashScreen()

  if (devConfig.forceOffline) {
    NetInfo.fetch = (): Promise<NetInfoState> =>
      Promise.resolve({
        details: null,
        isConnected: false,
        isInternetReachable: false,
        type: NetInfoStateType.none
      })
  }

  if (devConfig.ignoreLogBox) LogBox.ignoreAllLogs()
}

type DevConfig = typeof devConfig

export const getDevConfig = (isDev: boolean): DevConfig =>
  isDev
    ? devConfig
    : (Object.fromEntries(
        Object.entries(devConfig).map(([key, value]) => [
          key,
          typeof value === 'boolean' ? false : ''
        ])
      ) as DevConfig)
