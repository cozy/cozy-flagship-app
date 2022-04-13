import {useLayoutEffect} from 'react'
import StaticServer from 'react-native-static-server'
import {prepareAndroidAssets} from './copyAllFilesFromBundleAssets'
import {definePaths} from './definePaths'
import {Platform} from 'react-native'

export const useHttpServer = () => {
  const isIOS = Platform.OS === 'ios'
  const port = 5757
  const {iosPath, androidPath} = definePaths(isIOS)
  const path = isIOS ? iosPath : androidPath
  console.log('🚀 path', path)

  useLayoutEffect(() => {
    // TROUBLESHOOTING: 💡logout from homepage
    console.log('👩🏾‍🎤 useLayoutEffect')
    const server = new StaticServer(port, path, {
      localOnly: true,
      keepAlive: false,
    })

    const startingHttpServer = async () => {
      console.log('🚀 Copy android bundle assets')
      !isIOS && (await prepareAndroidAssets(androidPath))

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
  }, [androidPath, isIOS, path, port])
}
