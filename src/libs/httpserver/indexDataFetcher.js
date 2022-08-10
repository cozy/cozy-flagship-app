import { replaceAll } from '../functions/stringHelpers'
import { fetchCozyDataForSlug } from '../client'
import { getCookie } from './httpCookieManager'
import { logToSentry } from '/Sentry'

export const fetchAppDataForSlug = async (slug, client) => {
  try {
    const storedCookie = await getCookie(client)
    const cozyDataResult = await fetchCozyDataForSlug(
      slug,
      client,
      storedCookie
    )

    const { Cookie: cookie, ...cozyDataAttributes } =
      cozyDataResult.data.attributes

    const cozyData = {
      app: {
        editor: cozyDataAttributes.AppEditor,
        icon: cozyDataAttributes.IconPath,
        name: cozyDataAttributes.AppName,
        prefix: cozyDataAttributes.AppNamePrefix,
        slug: cozyDataAttributes.AppSlug
      },
      capabilities: JSON.parse(cozyDataAttributes.Capabilities),
      domain: cozyDataAttributes.Domain,
      flags: JSON.parse(cozyDataAttributes.Flags),
      locale: cozyDataAttributes.Locale,
      subdomain: cozyDataAttributes.SubDomain,
      token: cozyDataAttributes.Token,
      tracking: cozyDataAttributes.Tracking
    }

    let cozyDataString = JSON.stringify(cozyData)
    cozyDataString = replaceAll(cozyDataString, '"', '&#34;')

    cozyDataAttributes.Flags = replaceAll(
      cozyDataAttributes.Flags,
      '"',
      '&#34;'
    )

    cozyDataAttributes.Capabilities = replaceAll(
      cozyDataAttributes.Capabilities,
      '"',
      '&#34;'
    )

    return {
      cookie,
      templateValues: {
        ...cozyDataAttributes,
        CozyData: cozyDataString
      }
    }
  } catch (error) {
    logToSentry(error)
  }
}
