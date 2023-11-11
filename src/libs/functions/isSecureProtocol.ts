import type CozyClient from 'cozy-client'

export const isSecureProtocol = (client: CozyClient): boolean => {
  const instanceUrl = new URL(client.getStackClient().uri)

  return instanceUrl.protocol === 'https:'
}
