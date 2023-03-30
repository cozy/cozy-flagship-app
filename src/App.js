import AsyncStorage from '@react-native-async-storage/async-storage'
import FlipperAsyncStorage from 'rn-flipper-async-storage-advanced'
import RNAsyncStorageFlipper from 'rn-async-storage-flipper'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { StatusBar, StyleSheet, View } from 'react-native'
import { decode, encode } from 'base-64'

import { CozyProvider, useClient } from 'cozy-client'
import { NativeIntentProvider } from 'cozy-intent'

import { RootNavigator } from '/AppRouter'
import * as RootNavigation from '/libs/RootNavigation'
import NetStatusBoundary from '/libs/services/NetStatusBoundary'
import { CryptoWebView } from '/components/webviews/CryptoWebView/CryptoWebView'
import { HomeStateProvider } from '/screens/home/HomeStateProvider'
import { HttpServerProvider } from '/libs/httpserver/httpServerProvider'
import { SplashScreenProvider } from '/components/providers/SplashScreenProvider'
import { cleanKonnectorsOnBootInBackground } from '/libs/konnectors/cleanKonnectorsOnBoot'
import { getClient } from '/libs/client'
import { getColors } from '/ui/colors'
import { localMethods } from '/libs/intents/localMethods'
import { persistor, store } from '/redux/store'
import { useAppBootstrap } from '/hooks/useAppBootstrap.js'
import { useGlobalAppState } from '/hooks/useGlobalAppState'
import { useCookieResyncOnResume } from '/hooks/useCookieResyncOnResume'
import { useCozyEnvironmentOverride } from '/hooks/useCozyEnvironmentOverride'
import { useNotifications } from '/hooks/useNotifications'
import { useNetService } from '/libs/services/NetService'
import { withSentry } from '/libs/monitoring/Sentry'

// Polyfill needed for cozy-client connection
if (!global.btoa) {
  global.btoa = encode
}

if (!global.atob) {
  global.atob = decode
}

const App = ({ setClient }) => {
  const client = useClient()

  useNetService(client)

  const { initialRoute, isLoading } = useAppBootstrap(client)

  useGlobalAppState()
  useCookieResyncOnResume()
  useNotifications()
  useCozyEnvironmentOverride()

  if (isLoading) {
    return null
  }

  return <RootNavigator initialRoute={initialRoute} setClient={setClient} />
}

const WrappedApp = () => {
  const [client, setClient] = useState(undefined)

  useEffect(() => {
    const handleClientInit = async () => {
      try {
        const existingClient = await getClient()
        if (existingClient) {
          cleanKonnectorsOnBootInBackground(existingClient)
        }
        setClient(existingClient || null)
      } catch {
        setClient(null)
      }
    }

    handleClientInit()
  }, [])

  const Nav = () => (
    <NavigationContainer ref={RootNavigation.navigationRef}>
      <NativeIntentProvider localMethods={localMethods(client)}>
        <View
          style={[
            styles.view,
            {
              backgroundColor: colors.primaryColor
            }
          ]}
        >
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
          <App setClient={setClient} />
        </View>
      </NativeIntentProvider>
    </NavigationContainer>
  )

  if (client === null) return <Nav />

  if (client)
    return (
      <CozyProvider client={client}>
        <Nav />
      </CozyProvider>
    )

  return null
}

const Wrapper = () => {
  const [hasCrypto, setHasCrypto] = useState(false)
  useEffect(() => {
    if (__DEV__) {
      RNAsyncStorageFlipper(AsyncStorage)
    }
  }, [])
  return (
    <>
      {__DEV__ && <FlipperAsyncStorage />}
      <CryptoWebView setHasCrypto={setHasCrypto} />
      {hasCrypto && (
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <HttpServerProvider>
              <HomeStateProvider>
                <SplashScreenProvider>
                  <NetStatusBoundary>
                    <WrappedApp />
                  </NetStatusBoundary>
                </SplashScreenProvider>
              </HomeStateProvider>
            </HttpServerProvider>
          </PersistGate>
        </Provider>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})

export default withSentry(Wrapper)
