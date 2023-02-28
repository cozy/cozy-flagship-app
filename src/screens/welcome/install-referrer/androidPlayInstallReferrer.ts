import Minilog from '@cozy/minilog'
import {
  PlayInstallReferrer,
  PlayInstallReferrerInfo
} from 'react-native-play-install-referrer'

import {
  getEnforcedInstallReferrer,
  shouldForceInstallReferrer
} from '/core/tools/env'

const log = Minilog('AndroidPlayInstallReferrer')

export const getInstallReferrer =
  (): Promise<PlayInstallReferrerInfo | null> => {
    if (shouldForceInstallReferrer()) {
      const installReferrer = getEnforcedInstallReferrer()
      log.debug('Enforce InstallReferrer with: ' + installReferrer)
      return Promise.resolve({
        installReferrer
      } as PlayInstallReferrerInfo)
    }

    return new Promise(resolve => {
      PlayInstallReferrer.getInstallReferrerInfo(
        (installReferrerInfo, error): void => {
          if (!error) {
            resolve(installReferrerInfo)
          } else {
            // Here we silence the error as non-google devices would trigger it
            // In this case we prefer the code to act as if no referrer is provided
            // Also we don't want to trigger a Sentry alert in this case so `log.info` is enough
            log.info('Failed to get install referrer info!')
            log.info('Response code: ' + error.responseCode)
            log.info('Message: ' + error.message)
            resolve(null)
          }
        }
      )
    })
  }
