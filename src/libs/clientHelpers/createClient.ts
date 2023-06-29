import CozyClient from 'cozy-client'

import { androidSafetyNetApiKey } from '/constants/api-keys'
import strings from '/constants/strings.json'
import { SOFTWARE_ID } from '/libs/constants'
import { getClientName } from '/app/domain/authentication/services/SynchronizeService'

import packageJSON from '../../../package.json'

/**
 * Create a CozyClient for the given Cozy instance and register it
 *
 * @param {string} instance - the Cozy instance used to create the client
 * @returns {CozyClient} - The created and registered CozyClient
 */
export const createClient = async (instance: string): Promise<CozyClient> => {
  const options = {
    scope: ['*'],
    oauth: {
      redirectURI: strings.COZY_SCHEME,
      softwareID: SOFTWARE_ID,
      clientKind: 'mobile',
      clientName: await getClientName(),
      shouldRequireFlagshipPermissions: true,
      certificationConfig: { androidSafetyNetApiKey }
    },
    appMetadata: {
      slug: 'flagship',
      version: packageJSON.version
    }
  }

  const client = new CozyClient(options)

  const stackClient = client.getStackClient()
  stackClient.setUri(instance)
  await stackClient.register(instance)

  return client
}
