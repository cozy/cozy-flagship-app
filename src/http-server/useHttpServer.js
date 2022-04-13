import {useLayoutEffect} from 'react'
import StaticServer from 'react-native-static-server'
import {prepareAssets} from './copyAllFilesFromBundleAssets'
import {definePaths} from './definePaths'

export const useHttpServer = () => {
  console.log('👩🏾‍🎤 useHttpServer')
  const port = 5757
  const path = definePaths()

  useLayoutEffect(() => {
    console.log('🚀 path', path)
    // TROUBLESHOOTING: 💡logout from homepage
    console.log('👩🏾‍🎤 useLayoutEffect')
    const server = new StaticServer(port, path, {
      localOnly: true,
      keepAlive: false,
    })

    const startingHttpServer = async () => {
      await prepareAssets(path)
      console.log('🚀 Starting server')
      return server.start()
    }

    startingHttpServer().then(url => {
      console.log('🚀 Serving at URL', url)
    })

    return () => {
      console.log('❌ stopping server')
      server.stop()
    }
  }, [path, port])
}
