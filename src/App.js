import { NavigationContainer } from '@react-navigation/native'
import { decode, encode } from 'base-64'
import React, { useEffect, useState } from 'react'
import { StatusBar, StyleSheet, View } from 'react-native'

import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import FlipperAsyncStorage from 'rn-flipper-async-storage-advanced'

import { CozyProvider, useClient } from 'cozy-client'
import { NativeIntentProvider } from 'cozy-intent'

import rnperformance, {
  configurePerformances
} from '/app/domain/performances/measure'
import { usePerformancesUniversalLinks } from '/app/domain/performances/hooks/usePerformancesUniversalLinks'
import { RootNavigator } from '/AppRouter'
import * as RootNavigation from '/libs/RootNavigation'
import NetStatusBoundary from '/libs/services/NetStatusBoundary'
import { IconChangedModal } from '/libs/icon/IconChangedModal'
import { CryptoWebView } from '/components/webviews/CryptoWebView/CryptoWebView'
import { HomeStateProvider } from '/screens/home/HomeStateProvider'
import { HttpServerProvider } from '/libs/httpserver/httpServerProvider'
import { RestartProvider } from '/components/providers/RestartProvider'
import { SplashScreenProvider } from '/components/providers/SplashScreenProvider'
import { cleanKonnectorsOnBootInBackground } from '/libs/konnectors/cleanKonnectorsOnBoot'
import { getClient } from '/libs/client'
import { getColors } from '/ui/colors'
import { localMethods } from '/libs/intents/localMethods'
import { persistor, store } from '/redux/store'
import { useAppBootstrap } from '/hooks/useAppBootstrap'
import { useGlobalAppState } from '/hooks/useGlobalAppState'
import { useCookieResyncOnResume } from '/hooks/useCookieResyncOnResume'
import { useCozyEnvironmentOverride } from '/hooks/useCozyEnvironmentOverride'
import { useNotifications } from '/hooks/useNotifications'
import { useSynchronizeOnInit } from '/hooks/useSynchronizeOnInit'
import { useInitBackup } from '/app/domain/backup/hooks'
import { useNetService } from '/libs/services/NetService'
import { withSentry } from '/libs/monitoring/Sentry'
import { ThemeProvider } from '/app/theme/ThemeProvider'
import { useInitI18n } from '/locales/useInitI18n'
import { SecureBackgroundSplashScreenWrapper } from '/app/theme/SecureBackgroundSplashScreenWrapper'
import { PermissionsChecker } from '/app/domain/nativePermissions/components/PermissionsChecker'
import { useGeolocationTracking } from '/app/domain/geolocation/hooks/useGeolocationTracking'
import { OsReceiveProvider } from '/app/view/OsReceive/OsReceiveProvider'
import { ErrorProvider } from '/app/view/Error/ErrorProvider'
import { LoadingOverlayProvider } from '/app/view/Loading/LoadingOverlayProvider'
import { useOfflineDebugUniversalLinks } from '/app/domain/offline/hooks/useOfflineDebugUniversalLinks'
import { OsReceiveApi } from '/app/domain/osReceive/services/OsReceiveApi'
import {
  useOsReceiveDispatch,
  useOsReceiveState
} from '/app/view/OsReceive/state/OsReceiveState'
import { useOsReceiveApi } from '/app/view/OsReceive/hooks/useOsReceiveApi'
import { LockScreenWrapper } from '/app/view/Lock/LockScreenWrapper'
import { useSecureBackgroundSplashScreen } from '/hooks/useSplashScreen'
import {
  hideSplashScreen,
  setTimeoutForSplashScreen
} from '/app/theme/SplashScreenService'
import { initFlagshipUIService } from '/app/view/FlagshipUI'
import {
  useLauncherContext,
  LauncherContextProvider
} from '/screens/home/hooks/useLauncherContext'
import LauncherView from '/screens/konnectors/LauncherView'
import { makeImportantFilesAvailableOfflineInBackground } from '/app/domain/io.cozy.files/importantFiles'
import { useShareFiles } from '/app/domain/osReceive/services/shareFilesService'
import { ClouderyOffer } from '/app/view/IAP/ClouderyOffer'
import { useDimensions } from '/libs/dimensions'
import { configureFileLogger } from '/app/domain/logger/fileLogger'
import { useColorScheme } from '/app/theme/colorScheme'

if (__DEV__) {
  require('react-native-performance-flipper-reporter').setupDefaultFlipperReporter()
}

configurePerformances()
configureFileLogger()

rnperformance.mark('AppStart')
rnperformance.measure('AppStart', 'AppStart')

// Polyfill needed for cozy-client connection
if (!global.btoa) {
  global.btoa = encode
}

if (!global.atob) {
  global.atob = decode
}

const LoggedInWrapper = ({ children }) => {
  useColorScheme()

  return children
}

// eslint-disable-next-line react/display-name
const App = ({ setClient }) => {
  const client = useClient()

  useSynchronizeOnInit()
  useNetService(client)
  useInitI18n(client)
  useInitBackup(client)
  useOsReceiveApi()

  const { initialRoute, isLoading } = useAppBootstrap(client)

  useGlobalAppState()
  useSecureBackgroundSplashScreen()
  useCookieResyncOnResume()
  useNotifications()
  useGeolocationTracking()
  useCozyEnvironmentOverride()
  useOfflineDebugUniversalLinks(client)
  usePerformancesUniversalLinks(client)

  const {
    LauncherDialog,
    canDisplayLauncher,
    launcherClient,
    launcherContext,
    onKonnectorLog,
    onKonnectorJobUpdate,
    resetLauncherContext,
    setLauncherContext
  } = useLauncherContext()

  useEffect(() => {
    if (!client) {
      return
    }
    makeImportantFilesAvailableOfflineInBackground(client)
  }, [client])

  useEffect(() => {
    if (!isLoading) {
      rnperformance.measure('useAppBootstrap', 'AppStart')
    }
  }, [isLoading])

  useEffect(() => {
    rnperformance.measure('App', 'AppStart')
  }, [])

  if (isLoading) {
    return null
  }

  return (
    <>
      <RootNavigator initialRoute={initialRoute} setClient={setClient} />
      {canDisplayLauncher() && (
        <LauncherView
          launcherClient={launcherClient}
          launcherContext={launcherContext.value}
          retry={resetLauncherContext}
          setLauncherContext={setLauncherContext}
          onKonnectorLog={onKonnectorLog}
          onKonnectorJobUpdate={onKonnectorJobUpdate}
        />
      )}
      {LauncherDialog}
    </>
  )
}

const InnerNav = ({ client, setClient }) => {
  useDimensions()
  const colors = getColors()
  const osReceiveState = useOsReceiveState()
  const osReceiveDispatch = useOsReceiveDispatch()
  const { shareFiles } = useShareFiles()

  useEffect(() => {
    rnperformance.measure('InnerNav', 'AppStart')
  }, [])

  return (
    <NativeIntentProvider
      localMethods={localMethods(client, {
        ...OsReceiveApi(client, osReceiveState, osReceiveDispatch),
        hideSplashScreen: () => hideSplashScreen(),
        shareFiles
      })}
    >
      <View
        style={[
          styles.view,
          {
            backgroundColor: colors.splashScreenBackgroundColor
          }
        ]}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <IconChangedModal />
        <LauncherContextProvider>
          <App setClient={setClient} />
        </LauncherContextProvider>
      </View>
    </NativeIntentProvider>
  )
}

const Nav = ({ client, setClient }) => {
  useEffect(() => {
    rnperformance.measure('Nav', 'AppStart')
  }, [])

  return (
    <NavigationContainer ref={RootNavigation.navigationRef}>
      <SafeAreaProvider>
        <ErrorProvider>
          <LoadingOverlayProvider>
            <OsReceiveProvider>
              <InnerNav client={client} setClient={setClient} />
            </OsReceiveProvider>
          </LoadingOverlayProvider>
        </ErrorProvider>
        {client && <ClouderyOffer />}
        <LockScreenWrapper />
      </SafeAreaProvider>
    </NavigationContainer>
  )
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

  useEffect(
    function clearClientOnLogout() {
      const resetRoute = () => setClient(null)

      client?.on('logout', resetRoute)

      return () => client?.removeListener('logout', resetRoute)
    },
    [client]
  )

  useEffect(() => {
    rnperformance.measure('WrappedApp', 'AppStart')
  }, [])

  if (client === null) {
    return (
      <NetStatusBoundary>
        <Nav client={client} setClient={setClient} />
      </NetStatusBoundary>
    )
  }

  if (client)
    return (
      <CozyProvider client={client}>
        <LoggedInWrapper>
          <Nav client={client} setClient={setClient} />
        </LoggedInWrapper>
      </CozyProvider>
    )

  return null
}

const Wrapper = () => {
  const [hasCrypto, setHasCrypto] = useState(false)

  useEffect(() => {
    rnperformance.measure('Wrapper', 'AppStart')
    initFlagshipUIService()
    setTimeoutForSplashScreen()
  }, [])

  return (
    <>
      <RestartProvider>
        {__DEV__ && <FlipperAsyncStorage />}
        <CryptoWebView setHasCrypto={setHasCrypto} />
        {hasCrypto && (
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <HttpServerProvider>
                <HomeStateProvider>
                  <SplashScreenProvider>
                    <SecureBackgroundSplashScreenWrapper>
                      <ThemeProvider>
                        <PermissionsChecker>
                          <WrappedApp />
                        </PermissionsChecker>
                      </ThemeProvider>
                    </SecureBackgroundSplashScreenWrapper>
                  </SplashScreenProvider>
                </HomeStateProvider>
              </HttpServerProvider>
            </PersistGate>
          </Provider>
        )}
      </RestartProvider>
    </>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})

export default withSentry(Wrapper)
