import {Linking} from 'react-native'
import {useEffect, useState} from 'react'
import {changeBarColors} from 'react-native-immersive-bars'

import {getClient} from '../libs/client'
import {navigate} from '../libs/RootNavigation'
import {routes} from '../constants/routes'
import {useSplashScreen} from './useSplashScreen'

const parseFallbackURL = url => {
  const defaultParse = {fallback: undefined, root: routes.stack}

  if (url === null) {
    return defaultParse
  }

  try {
    const makeURL = new URL(url)
    const fallback = makeURL.searchParams.get('fallback')
    const isHome = makeURL.pathname.split('/')[1] === 'home'

    return {
      fallback: fallback ? fallback : undefined,
      root: isHome || !fallback ? routes.stack : routes.cozyapp,
      isHome,
    }
  } catch {
    return defaultParse
  }
}

export const useAppBootstrap = () => {
  const [client, setClient] = useState(null)
  const [initialRoute, setInitialRoute] = useState('fetching')
  const [initialScreen, setInitialScreen] = useState('fetching')
  const [isLoading, setIsLoading] = useState(true)
  const {hideSplashScreen} = useSplashScreen()

  // Handling client init
  useEffect(() => {
    getClient().then(clientResult => {
      if (clientResult) {
        setClient(clientResult)
      } else {
        setClient(undefined)
      }
    })
  }, [])

  // Handling initial URL init
  useEffect(() => {
    if (
      client !== null &&
      initialRoute === 'fetching' &&
      initialScreen === 'fetching'
    ) {
      if (!client) {
        setInitialRoute({stack: undefined, root: undefined})

        return setInitialScreen({
          stack: routes.authenticate,
          root: routes.stack,
        })
      }

      const doAsync = async () => {
        const payload = await Linking.getInitialURL()
        const {fallback, root, isHome} = parseFallbackURL(payload)

        setInitialScreen({stack: routes.home, root})
        setInitialRoute({
          stack: isHome ? fallback : undefined,
          root: !isHome ? fallback : undefined,
        })
      }

      doAsync()
    }
  }, [initialRoute, initialScreen, client])

  // Handling app readiness
  useEffect(() => {
    if (client !== 'fetching' && initialRoute !== 'fetching' && isLoading) {
      setIsLoading(false)
    }
  }, [isLoading, initialRoute, client])

  // Handling post load side effects
  useEffect(() => {
    if (isLoading) {
      return
    }

    const subscription = Linking.addEventListener('url', ({url}) => {
      const {fallback: href, isHome} = parseFallbackURL(url)

      if (!href) {
        return
      }

      navigate(isHome ? routes.home : routes.cozyapp, {href})
    })

    hideSplashScreen()
    changeBarColors(true)

    return () => {
      subscription.remove()
    }
  }, [isLoading, hideSplashScreen])

  return {
    client,
    initialRoute,
    initialScreen,
    isLoading,
    setClient,
  }
}
