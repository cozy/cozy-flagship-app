import { replaceAll } from '../functions/stringHelpers'
import { fetchCozyDataForSlug } from '../client'

export const fetchAppDataForSlug = async (slug, client) => {
  const cozyDataResult = await fetchCozyDataForSlug(slug, client)

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
    capabilities: cozyDataAttributes.Capabilities,
    domain: cozyDataAttributes.Domain,
    flags: cozyDataAttributes.Flags,
    locale: cozyDataAttributes.Locale,
    subdomain: cozyDataAttributes.SubDomain,
    token: cozyDataAttributes.Token,
    tracking: cozyDataAttributes.Tracking
  }

  let cozyDataString = JSON.stringify(cozyData)
  cozyDataString = replaceAll(cozyDataString, '"', '&#34;')

  return {
    cookie,
    templateValues: {
      ...cozyDataAttributes,
      CozyData: cozyDataString
    }
  }
}
