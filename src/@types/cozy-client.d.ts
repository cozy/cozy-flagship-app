/* eslint-disable @typescript-eslint/no-unused-vars */

import 'cozy-client'
declare module 'cozy-client' {
  interface ClientOptions {
    appMetadata?: AppMetadata
    autoHydrate?: boolean
    backgroundFetching?: boolean
    capabilities?: ClientCapabilities
    client?: object
    link?: object
    links?: object
    oauth?: object
    onError?: (...args: unknown[]) => unknown
    onTokenRefresh?: (...args: unknown[]) => unknown
    schema?: object
    stackClient?: object
    store?: boolean
    token?: Token
    uri?: string
    warningForCustomHandlers?: boolean
  }

  interface StackClient {
    fetchJSON: <T>(method: string, path: string) => Promise<T>
    fetchKonnectorToken: (slug: string) => Promise<string>
    fetchSessionCode: () => Promise<{ session_code: string }>
    getAuthorizationHeader: () => string
    uri: string
  }

  export const useClient = (): CozyClient => CozyClient as CozyClient

  export default class CozyClient {
    constructor(rawOptions?: ClientOptions)
    getStackClient(): StackClient
    isLogged: boolean
    on: (event: string, callback: () => void) => void
    removeListener: (event: string, callback: () => void) => void
    logout: () => Promise<void>
  }

  export const createMockClient = (options?: ClientOptions): CozyClient =>
    CozyClient as CozyClient
}
