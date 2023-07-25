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
export const STATE_2FA_PASSWORD_NEEDED = 'STATE_2FA_PASSWORD_NEEDED'
export const STATE_INVALID_PASSWORD = 'STATE_INVALID_PASSWORD'

export interface CozyClientCreationContext {
  client: CozyClient
  state:
    | 'STATE_CONNECTED'
    | 'STATE_AUTHORIZE_NEEDED'
    | 'STATE_2FA_NEEDED'
    | 'STATE_2FA_PASSWORD_NEEDED'
    | 'STATE_INVALID_PASSWORD'
  twoFactorToken?: string
  sessionCode?: string
}

interface Reason2FA {
  two_factor_token?: string
}

interface ReasonError {
  error?: string
}

interface FetchError extends Error {
  name: string
  response: string
  url: string
  status: number
  reason?: string | unknown[] | Reason2FA | ReasonError
}

export const isFetchError = (error: unknown): error is FetchError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as Record<string, unknown>).status === 'number'
  )
}

export const isErrorReason = (reason: unknown): reason is ReasonError => {
  return reason !== null && typeof reason === 'object' && 'error' in reason
}

export const is2FAReason = (reason: unknown): reason is Reason2FA => {
  return (
    reason !== null &&
    reason !== undefined &&
    typeof reason === 'object' &&
    'two_factor_token' in reason
  )
}

export const isStringReason = (reason: unknown): reason is string => {
  return reason !== null && typeof reason === 'string'
}

interface LoginFlagshipInvalidPasswordResult {
  invalidPassword: true
}

interface LoginFlagship2faPasswordNeededResult {
  twoFactorPasswordNeeded: true
}

export type LoginFlagshipResult =
  | CozyClientLoginFlagshipResult
  | LoginFlagshipInvalidPasswordResult
  | LoginFlagship2faPasswordNeededResult

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

export const is2faPasswordNeededResult = (
  result: LoginFlagshipResult
): result is LoginFlagship2faPasswordNeededResult => {
  return 'twoFactorPasswordNeeded' in result
}

export const isFlagshipVerificationNeededResult = (
  result: LoginFlagshipResult
): result is FlagshipVerificationNeededResult => {
  return 'session_code' in result && !!result.session_code
}

export const isAccessToken = (
  result: LoginFlagshipResult | SetPassphraseFlagshipResult
): result is AccessToken => {
  return 'access_token' in result && !!result.access_token
}
