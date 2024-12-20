import Minilog from 'cozy-minilog'
import { getDeviceName } from 'react-native-device-info'

import type CozyClient from 'cozy-client'
import { getErrorMessage } from 'cozy-intent'

import { SOFTWARE_NAME } from '/libs/constants'
import { saveClient } from '/libs/clientHelpers/persistClient'

export const syncLog = Minilog('📱 SynchronizeService')

export const SYNCHRONIZE_DELAY_IN_MS = 10 * 1000

export const synchronizeDevice = async (client: CozyClient): Promise<void> => {
  try {
    await client.getStackClient().fetchJSON('POST', '/settings/synchronized')
    syncLog.info('Device synchronized')
  } catch (error) {
    syncLog.warn('Error while synchronizing device', error)
  }
}

export const getClientName = async (): Promise<string> =>
  `${SOFTWARE_NAME} (${await getDeviceName()})`

export const checkClientName = async (client: CozyClient): Promise<void> => {
  try {
    const { clientName, ...oauthOptions } = client.getStackClient().oauthOptions
    const newClientName = await getClientName()

    if (!clientName.startsWith(newClientName)) {
      syncLog.info(`Updating client name...`, {
        oldClientName: clientName
      })

      const response = await client.getStackClient().updateInformation({
        ...oauthOptions,
        clientName: newClientName
      })

      await saveClient(client)

      syncLog.info(`Client name updated with "${newClientName}"`, {
        OAuthOptions: response
      })
    } else {
      syncLog.info(`Client name is up to date: "${clientName}"`)
    }
  } catch (error) {
    syncLog.error('Failed to update clientName', getErrorMessage(error))
  }
}

export const synchronizeOnInit = async (client: CozyClient): Promise<void> => {
  return new Promise(resolve => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(async (): Promise<void> => {
      await checkClientName(client)
      await synchronizeDevice(client)
      resolve()
    }, SYNCHRONIZE_DELAY_IN_MS)
  })
}
