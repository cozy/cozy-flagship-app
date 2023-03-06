import CozyClient, {
  generateWebLink,
  deconstructRedirectLink
} from 'cozy-client'

export const formatOnboardingRedirection = (
  onboardingRedirection: string,
  client: CozyClient
): string => {
  const cozyUrl = client.getStackClient().uri
  const subDomainType = client.getInstanceOptions().capabilities.flat_subdomains
    ? 'flat'
    : 'nested'

  const { slug, path, hash } = deconstructRedirectLink(onboardingRedirection)

  return generateWebLink({
    cozyUrl,
    subDomainType,
    slug,
    pathname: path,
    hash,
    searchParams: []
  })
}
