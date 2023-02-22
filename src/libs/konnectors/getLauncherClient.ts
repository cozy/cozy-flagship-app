import CozyClient from 'cozy-client'

import { getErrorMessage } from '/libs/functions/getErrorMessage'

/**
 * Gets the client to be used by the launcher.
 *
 * The launcher is the webview that displays the login form for a given konnector.
 * This function creates a new client with the right token for the konnector.
 *
 * @param {CozyClient} client - The main client
 * @param {string} slug - The konnector slug
 * @param {function} callback - A callback to be called with the new client
 * @returns {CozyClient} - A new client
 */
export const getLauncherClient = async (
  client: CozyClient,
  slug: string,
  callback?: (client: CozyClient) => void
): Promise<CozyClient> => {
  const { uri } = client.getStackClient()

  try {
    const newClient = new CozyClient({
      token: await client.getStackClient().fetchKonnectorToken(slug),
      uri
    })

    callback?.(newClient)

    return newClient
  } catch (error) {
    throw new Error(
      `Failed to create launcher client for ${slug}.\n,
      ${getErrorMessage(error)}`,
      { cause: error }
    )
  }
}
