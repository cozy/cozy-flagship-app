import type CozyClient from 'cozy-client'
import { Q, deconstructCozyWebLinkWithSlug } from 'cozy-client'

import { formatRedirectLink } from '/libs/functions/formatRedirectLink'
import { logger } from '/libs/functions/logger'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { changeIcon } from '/libs/icon/icon'
import {
  CozyPersistedStorageKeys,
  getData,
  storeData
} from '/libs/localStore/storage'

export const log = logger('AppBundle')

export const NAVIGATION_APP_SLUG = 'home'

export const DEFAULT_REDIRECTION_DELAY_IN_MS = 3000

export interface InstanceSettings {
  data: {
    attributes: {
      default_redirection: string
    }
  }
}

export type DefaultRedirectionUrl = string | null

export const fetchDefaultRedirectionUrl = async (
  client: CozyClient
): Promise<DefaultRedirectionUrl> => {
  let defaultRedirectionUrl: DefaultRedirectionUrl

  try {
    const { data } = (await client.query(
      Q('io.cozy.settings').getById('io.cozy.settings.instance'),
      {
        as: 'io.cozy.settings/instance'
      }
    )) as InstanceSettings

    const defaultRedirection = data.attributes.default_redirection

    defaultRedirectionUrl = formatRedirectLink(defaultRedirection, client)
  } catch {
    defaultRedirectionUrl = null
  }

  return defaultRedirectionUrl
}

export const setDefaultRedirectionUrl = async (
  defaultRedirectionUrl: string
): Promise<void> => {
  await storeData(
    CozyPersistedStorageKeys.DefaultRedirectionUrl,
    defaultRedirectionUrl
  )
}

export const getDefaultRedirectionUrl =
  async (): Promise<DefaultRedirectionUrl> => {
    return await getData(CozyPersistedStorageKeys.DefaultRedirectionUrl)
  }

export const setDefaultRedirectionUrlAndAppIcon = async (
  defaultRedirectionUrl: string,
  client: CozyClient
): Promise<void> => {
  await setDefaultRedirectionUrl(defaultRedirectionUrl)

  const subdomainType = client.capabilities.flat_subdomains ? 'flat' : 'nested'

  const { slug } = deconstructCozyWebLinkWithSlug(
    defaultRedirectionUrl,
    subdomainType
  )

  await changeIcon(slug)
}

export const setDefaultRedirection = async (
  defaultRedirection: string,
  client: CozyClient
): Promise<void> => {
  try {
    const defaultRedirectionUrl = formatRedirectLink(defaultRedirection, client)

    if (defaultRedirectionUrl === null) return

    await setDefaultRedirectionUrlAndAppIcon(defaultRedirectionUrl, client)
  } catch {
    return
  }
}

export const fetchAndSetDefaultRedirectionUrl = async (
  client: CozyClient
): Promise<DefaultRedirectionUrl> => {
  const newDefaultRedirectionUrl = await fetchDefaultRedirectionUrl(client)

  if (newDefaultRedirectionUrl === null) return null

  await setDefaultRedirectionUrlAndAppIcon(newDefaultRedirectionUrl, client)

  return newDefaultRedirectionUrl
}

export const fetchAndSetDefaultRedirectionUrlInBackground = (
  client: CozyClient,
  delayInMs = DEFAULT_REDIRECTION_DELAY_IN_MS
): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      fetchAndSetDefaultRedirectionUrl(client)
        .then(() => resolve())
        .catch(err =>
          log.error(
            `Something went wrong when fetching and setting default redirection url in background: ${getErrorMessage(
              err
            )}`,
            resolve()
          )
        )
    }, delayInMs)
  })
}

export const getOrFetchDefaultRedirectionUrl = async (
  client: CozyClient
): Promise<DefaultRedirectionUrl> => {
  let defaultRedirectionUrl = await getDefaultRedirectionUrl()
  if (defaultRedirectionUrl) {
    void fetchAndSetDefaultRedirectionUrlInBackground(client)
  } else {
    defaultRedirectionUrl = await fetchAndSetDefaultRedirectionUrl(client)
  }

  return defaultRedirectionUrl
}

export const getParamsWithDefaultRedirectionUrl = (
  defaultRedirectionUrl: DefaultRedirectionUrl,
  client: CozyClient
): object => {
  if (!defaultRedirectionUrl) {
    return {
      mainAppFallbackURL: undefined,
      cozyAppFallbackURL: undefined
    }
  }

  const subdomainType = client.capabilities.flat_subdomains ? 'flat' : 'nested'

  const { slug } = deconstructCozyWebLinkWithSlug(
    defaultRedirectionUrl,
    subdomainType
  )

  if (slug === NAVIGATION_APP_SLUG) {
    return {
      mainAppFallbackURL: defaultRedirectionUrl,
      cozyAppFallbackURL: undefined
    }
  } else {
    return {
      mainAppFallbackURL: undefined,
      cozyAppFallbackURL: defaultRedirectionUrl
    }
  }
}
