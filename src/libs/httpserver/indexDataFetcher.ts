import CozyClient from 'cozy-client'

import { AppData, AppAttributes } from '/libs/httpserver/models'
import { fetchCozyDataForSlug } from '/libs/client'
import { getCookie } from '/libs/httpserver/httpCookieManager'
import { logToSentry } from '/libs/monitoring/Sentry'
import { replaceAll } from '/libs/functions/stringHelpers'

export type TemplateValues = Omit<AppAttributes, 'Cookie'> & {
  CozyData: string
}

interface FetchAppDataForSlugResult {
  cookie: AppAttributes['Cookie']
  templateValues: TemplateValues
}

const sanitizeQuotes = (str: string): string => replaceAll(str, '"', '&#34;')

export const fetchAppDataForSlug = async (
  slug: string,
  client: CozyClient
): Promise<FetchAppDataForSlugResult> => {
  try {
    const storedCookie = await getCookie(client)
    const cozyDataResult = await fetchCozyDataForSlug<{ data: AppData }>(
      slug,
      client,
      storedCookie
    )

    const { Cookie: cookie, ...cozyDataAttributes } =
      cozyDataResult.data.attributes

    /**
     * We parse the Capabilities and Flags attributes before stringification,
     * This is to ensure that the resulting string doesn't have duplicate quotes
     */
    const CozyData = JSON.stringify({
      app: {
        editor: cozyDataAttributes.AppEditor,
        icon: cozyDataAttributes.IconPath,
        name: cozyDataAttributes.AppName,
        prefix: cozyDataAttributes.AppNamePrefix,
        slug: cozyDataAttributes.AppSlug
      },
      capabilities: JSON.parse(
        cozyDataAttributes.Capabilities
      ) as AppAttributes['Capabilities'],
      domain: cozyDataAttributes.Domain,
      flags: JSON.parse(cozyDataAttributes.Flags) as AppAttributes['Flags'],
      locale: cozyDataAttributes.Locale,
      subdomain: cozyDataAttributes.SubDomain as 'nested' | 'flat',
      token: cozyDataAttributes.Token,
      tracking: cozyDataAttributes.Tracking
    })

    return {
      cookie,
      templateValues: {
        ...cozyDataAttributes,
        // The following attributes have to be sanitized to avoid semantic quotes.
        // This is because the attributes are used in
        // the HTML as-is, and the browser will interpret the quotes as semantic ones.
        Capabilities: sanitizeQuotes(cozyDataAttributes.Capabilities),
        CozyData: sanitizeQuotes(CozyData),
        Flags: sanitizeQuotes(cozyDataAttributes.Flags)
      }
    }
  } catch (error) {
    logToSentry(error)
    throw error
  }
}
