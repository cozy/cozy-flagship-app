import Minilog from '@cozy/minilog'

import CozyClient, {
  generateWebLink,
  deconstructRedirectLink
} from 'cozy-client'

import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('formatRedirectLink')

export const formatRedirectLink = (
  redirectLink: string,
  client: CozyClient
): string | null => {
  const cozyUrl = client.getStackClient().uri
  const subDomainType = client.getInstanceOptions().capabilities.flat_subdomains
    ? 'flat'
    : 'nested'

  try {
    const { slug, pathname, hash } = deconstructRedirectLink(redirectLink)

    return generateWebLink({
      cozyUrl,
      subDomainType,
      slug,
      pathname,
      hash,
      searchParams: []
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something went wrong while trying to format redirect link: ${errorMessage}`
    )
    return null
  }
}
