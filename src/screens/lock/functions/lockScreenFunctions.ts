import { asyncLogout } from '/libs/intents/localMethods'
import { doHashPassword } from '/libs/functions/passwordHelpers'
import { getVaultInformation } from '/libs/keychain'
import { translation } from '/locales'
import { getFqdnFromClient } from '/libs/client'

interface CozyClient {
  getStackClient: () => {
    uri: string
    fetchJSON: <T>(method: string, path: string) => Promise<T>
  }
}

export const validatePassword = async ({
  client,
  input,
  onSuccess,
  onFailure
}: {
  client: CozyClient
  input: string
  onSuccess: () => void
  onFailure: (reason: string) => void
}): Promise<void> => {
  const { fqdn } = getFqdnFromClient(client)

  const { KdfIterations } = await client
    .getStackClient()
    .fetchJSON<{ KdfIterations: number }>('GET', '/public/prelogin')

  const hashedPassword = await doHashPassword(
    { password: input },
    fqdn,
    KdfIterations
  )

  const storedHash = await getVaultInformation('passwordHash')

  if (hashedPassword.passwordHash === storedHash) {
    try {
      return onSuccess()
    } catch (error) {
      return onFailure(translation.errors.unknown_error)
    }
  }

  return onFailure(translation.errors.badUnlockPassword)
}

export const logout = (): void => void asyncLogout()
