import type CozyClient from 'cozy-client'
import type { AccessToken } from 'cozy-client'

export const STATE_CONNECTED = 'STATE_CONNECTED'
export const STATE_AUTHORIZE_NEEDED = 'STATE_AUTHORIZE_NEEDED'
export const STATE_2FA_NEEDED = 'STATE_2FA_NEEDED'
export const STATE_INVALID_PASSWORD = 'STATE_INVALID_PASSWORD'

export interface CozyClientCreationContext {
  client: CozyClient
  state:
    | 'STATE_CONNECTED'
    | 'STATE_AUTHORIZE_NEEDED'
    | 'STATE_2FA_NEEDED'
    | 'STATE_INVALID_PASSWORD'
  twoFactorToken?: string
  sessionCode?: string
}

export interface FetchAccessTokenActionNeededResult {
  two_factor_token?: string
  session_code?: string
}

export type FetchAccessTokenResult = AccessToken &
  FetchAccessTokenActionNeededResult

interface FetchError {
  name: string
  response: string
  url: string
  status: number
  reason?: {
    two_factor_token?: string
  }
}

export const isFetchError = (error: unknown): error is FetchError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as Record<string, unknown>).status === 'number'
  )
}
