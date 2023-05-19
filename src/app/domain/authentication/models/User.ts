import CozyClient, { Q } from 'cozy-client'
import { ClientCapabilities } from 'cozy-client/types/types'
import flag from 'cozy-flags'

import { devlog } from '/core/tools/env'

export const canAuthWithOIDC = (client: CozyClient): boolean | undefined => {
  return isOidcAuth(client)
}

export const shouldCreatePassword = async (
  client: CozyClient
): Promise<boolean> => {
  const passwordDefined = await isPasswordDefined(client)

  return (
    !(await IsVaultInstalled(client)) &&
    (isOidcAuth(client) || isMagicLinkAuth(client)) &&
    !passwordDefined
  )
}

const IsVaultInstalled = async (client: CozyClient): Promise<boolean> => {
  try {
    const vault = await client
      .getStackClient()
      .fetchJSON<{ extension_installed?: boolean }>(
        'GET',
        '/data/io.cozy.settings/io.cozy.settings.bitwarden',
        []
      )

    return Boolean(vault.extension_installed)
  } catch {
    return false
  }
}

interface MyClientCapabilities extends ClientCapabilities {
  can_auth_with_magic_links: boolean
  can_auth_with_oidc: boolean
}

const isMagicLinkAuth = (client: CozyClient): boolean => {
  return (client.capabilities as MyClientCapabilities).can_auth_with_magic_links
}

const isOidcAuth = (client: CozyClient): boolean => {
  if (flag('passwords.oidc-auth')) {
    return true
  }
  return (client.capabilities as MyClientCapabilities).can_auth_with_oidc
}

const isPasswordDefined = async (
  client: CozyClient
): Promise<boolean | undefined> => {
  const result = (await client.query(
    Q('io.cozy.settings').getById('io.cozy.settings.instance'),
    {
      as: 'io.cozy.settings/io.cozy.settings.instance'
    }
  )) as Promise<unknown>

  if (!isInstanceSettings(result)) {
    throw new Error(
      'We encountered a problem while querying /settings/instance data'
    )
  }

  return result.data.attributes.password_defined
}

const isInstanceSettingsData = (obj: unknown): obj is InstanceSettingsData => {
  return typeof obj === 'object' && obj !== null && 'attributes' in obj
}

const isInstanceSettings = (item: unknown): item is InstanceSettings => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'data' in item &&
    isInstanceSettingsData((item as Partial<InstanceSettings>).data)
  )
}

interface InstanceSettingsData {
  attributes: {
    password_defined?: boolean
  }
}

interface InstanceSettings {
  data: InstanceSettingsData
}

export const savePassword = async (
  client: CozyClient,
  keys: SetKeys
): Promise<void> => {
  await client.getStackClient().fetchJSON('PUT', '/settings/passphrase', {
    new_passphrase: keys.passwordHash,
    hint: keys.hint,
    key: keys.key,
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
    iterations: 650000,
    force: true
  })

  devlog('🔑', 'Password saved')
}

export interface SetKeys {
  passwordHash: string
  hint: string
  iterations: number
  key: string
  publicKey: string
  privateKey: string
  masterKey: object
}

export interface PasswordParams {
  fqdn: string
  goBack: () => void
  instance: string
  kdfIterations: number
  setKeys: (keys: SetKeys) => void
}

export interface UnlockWithPassword {
  client: CozyClient
  input: string
  onSuccess: () => void
  onFailure: (reason: string) => void
}
