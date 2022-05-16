import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState
} from 'react'

import Minilog from '@cozy/minilog'
import { getServerBaseFolder } from './httpPaths'
import HttpServer from './HttpServer'

const log = Minilog('HttpServerProvider')

const DEFAULT_PORT = 5757

export const HttpServerContext = createContext(undefined)

export const useHttpServerContext = () => {
  const httpServerContext = useContext(HttpServerContext)

  return httpServerContext
}

export const HttpServerProvider = props => {
  const port = DEFAULT_PORT
  const path = getServerBaseFolder()

  const [serverInstance, setServerInstance] = useState(undefined)

  useLayoutEffect(() => {
    const server = new HttpServer(port, path, {
      localOnly: true,
      keepAlive: false
    })

    const startingHttpServer = async () => {
      log.debug('🚀 Starting server')
      return server.start()
    }

    startingHttpServer()
      .then(url => {
        log.debug('🚀 Serving at URL', url)

        setServerInstance(server)
        return
      })
      .catch(error => log.error(error))

    return () => {
      log.debug('❌ stopping server')
      server.stop()
      setServerInstance(undefined)
    }
  }, [path, port])

  const isRunning = () => serverInstance?.isRunning()

  return (
    <HttpServerContext.Provider
      value={{
        server: serverInstance,
        isRunning,
      }}
      {...props}
    />
  )
}
