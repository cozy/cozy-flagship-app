import CozyClient from 'cozy-client'

import { CozyClientPerformanceApi } from '/app/domain/performances/measure'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import type { Konnector } from '/libs/konnectors/models'
/**
 * Gets the client to be used by the launcher.
 *
 * The launcher is the webview that displays the login form for a given konnector.
 * This function creates a new client with the right token for the konnector.
 *
 * @param {CozyClient} client - The main client
 * @param {Konnector} Konnector - The konnector
 * @param {function} callback - A callback to be called with the new client
 * @returns {CozyClient} - A new client
 */
export const getLauncherClient = async (
  client: CozyClient,
  konnector: Konnector,
  callback?: (client: CozyClient) => void
): Promise<CozyClient> => {
  const { uri } = client.getStackClient()
  const token = await client
    .getStackClient()
    .fetchKonnectorToken(konnector.slug)
  try {
    const newClient = new CozyClient({
      token,
      uri,
      appMetadata: {
        slug: konnector.slug,
        version: konnector.version
      },
      performanceApi: CozyClientPerformanceApi
    })

    callback?.(newClient)

    return newClient
  } catch (error) {
    throw new Error(
      `Failed to create launcher client for ${konnector.slug}.\n,
      ${getErrorMessage(error)}`,
      { cause: error }
    )
  }
}
