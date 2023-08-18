import CozyClient, { generateWebLink, Q } from 'cozy-client'

import { sharingLogger } from '..'
import { SharingCozyApp } from '../models/SharingCozyApp'

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
  cozyApps: SharingCozyApp[],
  client: CozyClient,
  session: { subDomainType: string }
): { href: string; slug: string } | undefined => {
  try {
    if (!Array.isArray(cozyApps) || cozyApps.length === 0) return undefined

    const cozyApp = cozyApps.find(cozyApp => cozyApp.slug === 'drive')
    if (!cozyApp) return undefined

    const hash =
      cozyApp.accept_documents_from_flagship?.route_to_upload ??
      cozyApp.attributes.accept_documents_from_flagship?.route_to_upload
    const slug = cozyApp.slug
    if (!hash || !slug) return undefined

    const href = generateWebLink({
      cozyUrl: client.getStackClient().uri,
      pathname: '',
      slug,
      subDomainType: session.subDomainType,
      hash: hash.replace(/^\/?#?\//, ''),
      searchParams: []
    })

    sharingLogger.info('routeToUpload is', { href, slug })
    return { href, slug: cozyApp.slug }
  } catch (error) {
    sharingLogger.error('Error when getting routeToUpload', error)
    return undefined
  }
}
