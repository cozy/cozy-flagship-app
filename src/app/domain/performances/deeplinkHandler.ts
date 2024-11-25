import CozyClient from 'cozy-client'

import strings from '/constants/strings.json'
import { sendPerformancesByEmail } from '/app/domain/performances/sendPerformancesByEmail'

export const handlePerformancesDeepLink = (
  url: string,
  client?: CozyClient
): boolean => {
  if (isSendPerformancesDeepLink(url)) {
    void sendPerformancesByEmail(client)

    return true
  }

  return false
}

const isSendPerformancesDeepLink = (url: string): boolean => {
  const deepLinks = [
    `${strings.COZY_SCHEME}sendperfs`,
    `${strings.UNIVERSAL_LINK_BASE}/sendperfs`
  ]

  return deepLinks.includes(url.toLowerCase())
}
