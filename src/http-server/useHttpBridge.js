import {useLayoutEffect} from 'react'
import {encode, decode} from 'base-64'
import httpBridge from '@cheungpat/react-native-http-bridge'
import {loadHomeBuild} from './loadHomeBuild'

// Polyfill needed for cozy-client connection
if (!global.btoa) {
  global.btoa = encode
}

if (!global.atob) {
  global.atob = decode
}

export const useHttpServer = () => {
  useLayoutEffect(() => {
    console.log('👩🏾‍🎤 useLayoutEffect')

    const startHttpBridge = async () => {
      // initialize the server (now accessible via localhost:1234)
      let port = 5561 // cannot be in 8080 on iOS
      await httpBridge.start(port, 'http_service', async request => {
        console.log('👩🏾‍🎤‍ inside http bridge start')
        console.log({request})
        // you can use request.url, request.type and request.postData here
        const url = new URL(`http://${request.headers.host}${request.url}`)
        if (request.type === 'GET' && url.pathname === '/users') {
          // TODO: return home v1 built during the release of the AA
          console.log('🎱 inside http bridge start')
          const homeBuiltDuringAppAmiraleRelease = await loadHomeBuild()
          console.log(homeBuiltDuringAppAmiraleRelease)
          console.log('🎱 inside http bridge start')

          // eslint-disable-next-line
          const encodedBody = encode(`{"message": "OK on this host: ${request.headers.host}"}`)
          // eslint-disable-next-line
          httpBridge.respond(request.requestId, 200, "application/json", encodedBody)
        } else {
          const encodedBody = encode('{"message": "Bad Request"}')
          // eslint-disable-next-line
          httpBridge.respond(request.requestId, 400, "application/json", encodedBody)
        }
      })
      console.log('👩🏾‍🎤 end of startHttpBridge')
    }
    startHttpBridge()
    return () => {
      console.log('useLayoutEffect stop')
      httpBridge.stop()
    }
  }, [])
}
