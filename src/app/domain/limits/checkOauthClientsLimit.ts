import CozyClient from 'cozy-client'

interface ClientsUsageResult {
  data?: {
    attributes?: {
      count: number
      limit: number
    }
  }
}

export const checkOauthClientsLimit = async (
  client: CozyClient
): Promise<boolean> => {
  const stackClient = client.getStackClient()
  const result = await stackClient.fetchJSON<ClientsUsageResult>(
    'GET',
    `/settings/clients-usage`
  )

  const count = result.data?.attributes?.count ?? 0
  const limit = result.data?.attributes?.limit ?? 1

  return count > limit
}
