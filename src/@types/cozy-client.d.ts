declare module 'cozy-client/dist/mock'

declare module 'cozy-client' {
  interface CozyClient {
    getStackClient(): StackClient
    isLogged: boolean
    on: (event: string, callback: () => void) => void
    removeListener: (event: string, callback: () => void) => void
    logout: () => Promise<void>
  }

  interface StackClient {
    fetchJSON: <T>(method: string, path: string) => Promise<T>
    uri: string
    getAuthorizationHeader: () => string
    fetchSessionCode: () => Promise<{ session_code: string }>
  }

  export const useClient = (): CozyClient => CozyClient as CozyClient

  export default CozyClient
}
