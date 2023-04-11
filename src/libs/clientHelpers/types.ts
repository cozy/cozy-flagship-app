import type CozyClient from 'cozy-client'
import type {
  AccessToken,
  LoginFlagship2faNeededResult,
  LoginFlagshipResult as CozyClientLoginFlagshipResult,
  FlagshipVerificationNeededResult,
  SetPassphraseFlagshipResult
} from 'cozy-client'

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

interface FetchError extends Error {
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

interface LoginFlagshipInvalidPasswordResult {
  invalidPassword: true
}

export type LoginFlagshipResult =
  | CozyClientLoginFlagshipResult
  | LoginFlagshipInvalidPasswordResult

export const isInvalidPasswordResult = (
  result: LoginFlagshipResult
): result is LoginFlagshipInvalidPasswordResult => {
  return 'invalidPassword' in result
}

export const is2faNeededResult = (
  result: LoginFlagshipResult
): result is LoginFlagship2faNeededResult => {
  return 'two_factor_token' in result && !!result.two_factor_token
}

export const isFlagshipVerificationNeededResult = (
  result: LoginFlagshipResult
): result is FlagshipVerificationNeededResult => {
  return 'session_code' in result && !!result.session_code
}

export const isAccessToken = (
  result: SetPassphraseFlagshipResult
): result is AccessToken => {
  return 'access_token' in result && !!result.access_token
}
