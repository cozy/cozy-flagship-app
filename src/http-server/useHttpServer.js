import {useLayoutEffect} from 'react'
import StaticServer from 'react-native-static-server'
// import {loadHomeBuild} from './loadHomeBuild'
import RNFS from 'react-native-fs'
import {Platform} from 'react-native'

export const useHttpServer = () => {
  // create a path you want to write to
  const slug = 'home'
  // const correctSourcePath = RNFS.DocumentDirectoryPath
  const iosSourcePath =
    '/Users/recontact/Library/Developer/CoreSimulator/Devices/A4624548-5C2D-4861-82FB-E3351028B1B6/data/Containers/Data/Application/FE3BDCFF-A01E-4C6F-8D55-DEEAA339B4E0/Documents'
  const isIOS = Platform.OS === 'ios'
  let iosPath = iosSourcePath + '/cozy-' + slug + '/build'
  // let androidPath = 'file:///android_asset' + '/cozy/cozy-' + slug + '/build'
  let androidPath = RNFS.DocumentDirectoryPath + '/cozy-home'
  const path = isIOS ? iosPath : androidPath
  const port = 5757

  useLayoutEffect(() => {
    // TROUBLESHOOTING: 💡logout from homepage
    let server = new StaticServer(port, path, {
      localOnly: true,
      keepAlive: false,
    })
    console.log('👩🏾‍🎤 useLayoutEffect')
    console.log('🚀 starting server')

    console.log(RNFS.DocumentDirectoryPath)

    const recursiveMethod = async (originPath, destinationPath) => {
      const content = await RNFS.readDirAssets(originPath)
      for (let asset of content) {
        if (asset.isDirectory()) {
          await RNFS.mkdir(destinationPath + '/' + asset.name)
          await recursiveMethod(asset.path, destinationPath + '/' + asset.name)
        } else {
          await RNFS.copyFileAssets(
            asset.path,
            destinationPath + '/' + asset.name,
          )
        }
      }
    }
    const toto = async () => {
      await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/cozy-home')
      await recursiveMethod(
        'cozy/cozy-home/build',
        RNFS.DocumentDirectoryPath + '/cozy-home',
      )
      server.start().then(url => {
        console.log('🚀 Serving at URL', url)
        console.log('🚀🚀🚀🚀 path', path)
        // ios: /Users/recontact/Library/Developer/CoreSimulator/Devices/A4624548-5C2D-4861-82FB-E3351028B1B6/data/Containers/Data/Application/FE3BDCFF-A01E-4C6F-8D55-DEEAA339B4E0/Documents
        // android: /data/user/0/io.cozy.flagship.mobile/files/cozy/cozy-home/build

        // RNFS.readFileAssets('/cozy/cozy-' + slug + '/build', 'base64') // 'base64' for binary
        // RNFS.readFileAssets('index.html')
        //   .then(binary => {
        //     // work with it
        //     console.log('🚀🚀🚀🚀 binary', binary)
        //   })
        //   .catch(console.error)

        // RNFS.stat('file:///android_asset/index.html')
        //   .then(binary => {
        //     // work with it
        //     console.log('🚀🚀🚀🚀 binary', binary)
        //   })
        //   .catch(console.error)

        // RNFS.readDirAssets('cozy/cozy-home/build')
        //   .then(binary => {
        //     // work with it
        //     console.log('🚀🚀🚀🚀 binary', binary)
        //     binary[0]
        //   })
        //   .catch(console.error)
      })
    }
    toto()
    // Check if native server running
    // const isRunning = await server.isRunning()
    // isRunning - true/false

    return () => {
      console.log('❌ stopping server')
      server.stop()
    }
  }, [path, port])
}
