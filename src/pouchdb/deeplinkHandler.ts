import CozyClient from 'cozy-client'

import strings from '/constants/strings.json'
import { resetLinksAndRestart } from '/pouchdb/getLinks'
import { sendDbByEmail } from '/pouchdb/sendDbByEmail'

export const handleDbDeepLink = (url: string, client?: CozyClient): boolean => {
  if (isSendDbDeepLink(url)) {
    void sendDbByEmail(client)

    return true
  }

  if (isResetDbDeepLink(url)) {
    void resetLinksAndRestart(client)

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

const isResetDbDeepLink = (url: string): boolean => {
  const deepLinks = [
    `${strings.COZY_SCHEME}resetdb`,
    `${strings.UNIVERSAL_LINK_BASE}/resetdb`
  ]

  return deepLinks.includes(url.toLowerCase())
}
