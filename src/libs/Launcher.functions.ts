import CozyClient, { Q } from 'cozy-client'
import type { CozyClientDocument } from 'cozy-client/types/types'

export const cleanExistingAccountsForKonnector = async (
  client: CozyClient,
  konnectorSlug: string,
  log?: MiniLogger
): Promise<void> => {
  const { data: accounts } = (await client.query(
    Q('io.cozy.accounts').where({
      accountType: konnectorSlug
    })
  )) as { data: CozyClientDocument[] }

  if (accounts.length === 0) {
    log?.info(`No existing accounts for "${konnectorSlug}"`)
    return
  }

  log?.info(
    `Deleting ${accounts.length} existing accounts for "${konnectorSlug}"`
  )

  for (const account of accounts) {
    await client.destroy(account)
  }
}
