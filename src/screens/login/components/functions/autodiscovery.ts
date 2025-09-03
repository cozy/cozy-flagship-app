import strings from '/constants/strings.json'

interface TwakeConfiguration {
  'twake-pass-login-uri'?: string
  'twake-flagship-login-uri'?: string
}

export const extractDomain = (companyEmail: string): string | null => {
  if (!companyEmail) {
    return null
  }

  const email = companyEmail.trim()

  const atIndex = email.lastIndexOf('@')

  if (atIndex === -1) {
    return null
  }

  return email.substring(atIndex + 1)
}

export const fetchLoginUriWithWellKnown = async (
  domain: string
): Promise<URL | null> => {
  const url = `https://${domain}/.well-known/twake-configuration`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })

    if (response.ok) {
      const twakeConfiguration: TwakeConfiguration =
        (await response.json()) as unknown as TwakeConfiguration

      if (!twakeConfiguration['twake-flagship-login-uri']) {
        return null
      }

      return new URL(twakeConfiguration['twake-flagship-login-uri'])
    } else {
      return null
    }
  } catch {
    return null
  }
}

export const getLoginUri = async (
  companyEmail: string
): Promise<URL | null> => {
  try {
    const domain = extractDomain(companyEmail)

    if (!domain) {
      throw new Error()
    }

    const uriFromWellKnown = await fetchLoginUriWithWellKnown(domain)

    if (uriFromWellKnown) {
      uriFromWellKnown.searchParams.append(
        'redirect_after_oidc',
        strings.COZY_SCHEME
      )
      return uriFromWellKnown
    }

    return null
  } catch {
    return null
  }
}
