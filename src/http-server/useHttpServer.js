import {useLayoutEffect} from 'react'
import StaticServer from 'react-native-static-server'
// import {loadHomeBuild} from './loadHomeBuild'
import RNFS from 'react-native-fs'

export const useHttpServer = () => {
  // create a path you want to write to
  const slug = 'home'
  const path = RNFS.DocumentDirectoryPath + '/cozy-' + slug + '/build'
  const port = 5757

  useLayoutEffect(() => {
    let server = new StaticServer(port, path, {
      localOnly: true,
      keepAlive: false,
    })
    console.log('👩🏾‍🎤 useLayoutEffect')
    console.log('🚀 starting server')
    server.start().then(url => {
      console.log('🚀 Serving at URL', url)
      console.log('🚀🚀🚀🚀 path', path)
      // /Users/recontact/Library/Developer/CoreSimulator/Devices/A4624548-5C2D-4861-82FB-E3351028B1B6/data/Containers/Data/Application/FE3BDCFF-A01E-4C6F-8D55-DEEAA339B4E0/Documents/www
    })

    // Check if native server running
    // const isRunning = await server.isRunning()
    // isRunning - true/false

    return () => {
      console.log('❌ stopping server')
      server.stop()
    }
  }, [path, port])
}
