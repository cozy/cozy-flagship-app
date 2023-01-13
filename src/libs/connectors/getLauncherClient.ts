import CozyClient from 'cozy-client'

import { getErrorMessage } from '/libs/functions/getErrorMessage'

/**
 * Gets the client to be used by the launcher.
 *
 * The launcher is the webview that displays the login form for a given connector.
 * This function creates a new client with the right token for the connector.
 *
 * @param {CozyClient} client - The main client
 * @param {string} slug - The connector slug
 * @param {function} callback - A callback to be called with the new client
 * @returns {CozyClient} - A new client
 */
export const getLauncherClient = async (
  client: CozyClient,
  slug: string,
  callback?: (client: CozyClient) => void
): Promise<CozyClient> => {
  const { fetchKonnectorToken, uri } = client.getStackClient()

  try {
    const client = new CozyClient({
      token: await fetchKonnectorToken(slug),
      uri
    })

    callback?.(client)

    return client
  } catch (error) {
    throw new Error(
      `Failed to create launcher client for ${slug}.\n,
      ${getErrorMessage(error)}`,
      { cause: error }
    )
  }
}
