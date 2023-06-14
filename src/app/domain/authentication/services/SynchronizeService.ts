import Minilog from '@cozy/minilog'

import type CozyClient from 'cozy-client'

const log = Minilog('SynchronizeService')

export const synchronizeDevice = async (client: CozyClient): Promise<void> => {
  try {
    await client.getStackClient().fetchJSON('POST', '/settings/synchronized')
    log.info('📱 Device synchronized')
  } catch (error) {
    log.warn('Error while synchronizing device', error)
  }
}
