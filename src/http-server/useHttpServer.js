import {useLayoutEffect} from 'react'
import StaticServer from 'react-native-static-server'
// import {loadHomeBuild} from './loadHomeBuild'
import RNFS from 'react-native-fs'
import {Platform} from 'react-native'
import {prepareAndroidAssets} from './copyAllFilesFromBundleAssets'

export const useHttpServer = () => {
  // create a path you want to write to
  const slug = 'home'
  // const correctSourcePath = RNFS.DocumentDirectoryPath
  const iosSourcePath =
    '/Users/recontact/Library/Developer/CoreSimulator/Devices/A4624548-5C2D-4861-82FB-E3351028B1B6/data/Containers/Data/Application/FE3BDCFF-A01E-4C6F-8D55-DEEAA339B4E0/Documents'
  const isIOS = Platform.OS === 'ios'
  const appName = '/cozy-' + slug
  const iosPath = iosSourcePath + appName + '/build'
  const androidPath = RNFS.DocumentDirectoryPath + appName
  const path = isIOS ? iosPath : androidPath
  const port = 5757
  console.log('🚀 path', path)

  useLayoutEffect(() => {
    // TROUBLESHOOTING: 💡logout from homepage
    console.log('👩🏾‍🎤 useLayoutEffect')
    const server = new StaticServer(port, path, {
      localOnly: true,
      keepAlive: false,
    })

    const startingHttpServer = async () => {
      console.log('🚀 copy android bundle assets')
      !isIOS && (await prepareAndroidAssets(androidPath))

      console.log('🚀 starting server')
      return server.start()

      // ios: /Users/recontact/Library/Developer/CoreSimulator/Devices/A4624548-5C2D-4861-82FB-E3351028B1B6/data/Containers/Data/Application/FE3BDCFF-A01E-4C6F-8D55-DEEAA339B4E0/Documents
      // android: /data/user/0/io.cozy.flagship.mobile/files/cozy/cozy-home/build
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
