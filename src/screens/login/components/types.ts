export interface LoginData {
  passwordHash: string
  hint: string
  iterations: number
  key: string
  publicKey: string
  privateKey: string
}

export interface TwoFactorAuthenticationData {
  token: string
  passcode: string
}
