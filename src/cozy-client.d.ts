declare module 'cozy-client' {
  const getStackClient: () => {
    getAuthorizationHeader()
    uri: string
    fetchJSON: <T>(method: string, path: string) => Promise<T>
  }

  export const useClient: () => {
    getStackClient
    useClient
  }
  const client = {
    getStackClient,
    useClient
  }

  export default client
}
