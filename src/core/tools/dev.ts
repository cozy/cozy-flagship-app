import NetInfo, {
  NetInfoState,
  NetInfoStateType
} from '@react-native-community/netinfo'
import { LogBox } from 'react-native'

import { devlog } from '/core/tools/env'
import { devConfig } from '/constants/dev-config'
import { hideSplashScreen } from '/app/theme/SplashScreenService'

export const initDev = async (isDev: boolean): Promise<void> => {
  if (!isDev) return

  if (devConfig.forceHideSplashScreen) {
    devlog('⚠️ devConfig.forceHideSplashScreen')
    await hideSplashScreen()
  }

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
