import CozyClient, { generateWebLink, Q } from 'cozy-client'

import { sharingLogger } from '/app/domain/sharing'
import { SharingCozyApp } from '/app/domain/sharing/models/SharingCozyApp'
import { ServiceResponse } from '/app/domain/sharing/models/SharingState'

export const fetchSharingCozyApps = {
  definition: Q('io.cozy.apps').where({
    'accept_documents_from_flagship.route_to_upload': { $exists: true },
    accept_from_flagship: true
  }),
  options: {
    as: 'io.cozy.apps/fetchSharingCozyApps'
  }
}

export const getRouteToUpload = (
  cozyApps?: SharingCozyApp[],
  client?: CozyClient | null,
  appName = 'drive'
): ServiceResponse<{ href: string; slug: string }> => {
  try {
    if (!client || !Array.isArray(cozyApps) || cozyApps.length === 0) return {}

    const cozyApp = cozyApps.find(cozyApp => cozyApp.slug === appName)
    if (!cozyApp) return {}
    const hash =
      cozyApp.accept_documents_from_flagship?.route_to_upload ??
      cozyApp.attributes.accept_documents_from_flagship?.route_to_upload
    const slug = cozyApp.slug
    if (!hash || !slug) return {}

    const href = generateWebLink({
      cozyUrl: client.getStackClient().uri,
      pathname: '',
      slug,
      subDomainType: client.capabilities.flat_subdomains ? 'flat' : 'nested',
      hash: hash.replace(/^\/?#?\//, ''),
      searchParams: []
    })

    sharingLogger.info('routeToUpload is', { href, slug })
    return { result: { href, slug: cozyApp.slug } }
  } catch (error) {
    sharingLogger.error('Error when getting routeToUpload', error)
    return { error: 'Error determining route to upload.' }
  }
}
