import CozyClient from 'cozy-client'

import strings from '/constants/strings.json'
import { sendDbByEmail } from '/pouchdb/sendDbByEmail'

export const handleDbDeepLink = (url: string, client?: CozyClient): boolean => {
  if (isSendDbDeepLink(url)) {
    void sendDbByEmail(client)

    return true
  }

  return false
}

const isSendDbDeepLink = (url: string): boolean => {
  const deepLinks = [
    `${strings.COZY_SCHEME}senddb`,
    `${strings.UNIVERSAL_LINK_BASE}/senddb`
  ]

  return deepLinks.includes(url.toLowerCase())
}
