import Minilog from 'cozy-minilog'

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import { StyleSheet, View } from 'react-native'
import type {
  WebView,
  WebViewMessageEvent,
  WebViewNavigation,
  WebViewProps
} from 'react-native-webview'

import { routes } from '/constants/routes'
import { jsCozyGlobal } from '/components/webviews/jsInteractions/jsCozyInjection'
import { jsLogInterception } from '/components/webviews/jsInteractions/jsLogInterception'
import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import {
  triggerAutofocusFocusOnWebview,
  handleAutofocusFields,
  tryProcessQueryKeyboardMessage
} from '/libs/functions/keyboardHelper'
import { NetService } from '/libs/services/NetService'
import { ClouderyUrls } from '/screens/login/cloudery-env/clouderyEnv'
import {
  fetchThemeOnLoad,
  tryProcessClouderyThemeMessage
} from '/screens/login/components/functions/clouderyThemeFetcher'
import type { ClouderyTheme } from '/screens/login/components/functions/clouderyThemeFetcher'
import {
  interceptExternalLinksAndOpenInAppBrowser,
  openWindowWithInAppBrowser
} from '/screens/login/components/functions/interceptExternalLinks'
import { LOGIN_FLAGSHIP_URL } from '/screens/login/components/functions/oidc'
import { jsPaddingInjection } from '/screens/login/components/functions/webViewPaddingInjection'
import { APPLICATION_NAME_FOR_USER_AGENT } from '/constants/userAgent'
import { navigationRef } from '/libs/RootNavigation'

const log = Minilog('ClouderyViewSwitchProps')

export const CLOUDERY_MODE_LOGIN = 'CLOUDERY_MODE_LOGIN'
export const CLOUDERY_MODE_SIGNING = 'CLOUDERY_MODE_SIGNING'

interface ClouderyViewSwitchProps {
  clouderyTheme: ClouderyTheme
  disableAutofocus: boolean
  clouderyMode: 'CLOUDERY_MODE_LOGIN' | 'CLOUDERY_MODE_SIGNING'
  handleNavigation: (request: WebViewNavigation) => boolean
  setCanGoBack: (newState: boolean) => void
  urls: ClouderyUrls
  setClouderyTheme: (theme: ClouderyTheme) => void
  setLoading: (newState: boolean) => void
}

interface ClouderyWebViewProps {
  clouderyTheme: ClouderyTheme
  disableAutofocus: boolean
  handleNavigation: (request: WebViewNavigation) => boolean
  onLoadEnd: () => void
  setCanGoBack: (newState: boolean) => void
  uri: string
}

/**
 * Display a Cloudery page based on URLs provided in given ClouderyUrls (urls)
 *
 * If ClouderyUrls expose both loginUrl and signinUrl, the two webview are pre-loaded and we display
 * one of them based on 'clouderyMode' prop
 *
 * If ClouderyUrls is a PartnerClouderyUrl, then only the loginUrl is loaded
 */
export const ClouderyViewSwitch = forwardRef(
  (
    {
      clouderyTheme,
      disableAutofocus,
      clouderyMode,
      handleNavigation,
      setCanGoBack,
      urls,
      setClouderyTheme,
      setLoading
    }: ClouderyViewSwitchProps,
    ref
  ) => {
    const webviewLoginRef = useRef<WebView>()
    const webviewSigninRef = useRef<WebView>()
    const [loginLoaded, setLoginLoaded] = useState(false)
    const [signinLoaded, setSigninLoaded] = useState(urls.isOnboardingPartner)

    useEffect(() => {
      if (loginLoaded && signinLoaded) {
        setLoading(false)
      }
    }, [loginLoaded, signinLoaded, setLoading])

    useImperativeHandle(ref, () => ({
      goBack(): void {
        if (clouderyMode === CLOUDERY_MODE_LOGIN) {
          webviewLoginRef.current?.goBack()
        } else {
          webviewSigninRef.current?.goBack()
        }
      }
    }))

    const onSigninLoadEnd = (): void => {
      setSigninLoaded(true)
    }

    const onLoginLoadEnd = (): void => {
      setLoginLoaded(true)
    }

    const processMessage = (event: WebViewMessageEvent): void => {
      tryProcessClouderyThemeMessage(event, setClouderyTheme)
    }

    return (
      <>
        {!urls.isOnboardingPartner && (
          <View
            style={[
              styles.clouderySigninView,
              { zIndex: clouderyMode === CLOUDERY_MODE_LOGIN ? 1 : 2 }
            ]}
            key="ViewSignin"
            testID="ViewSignin"
          >
            <ClouderyWebView
              applicationNameForUserAgent={APPLICATION_NAME_FOR_USER_AGENT}
              ref={webviewSigninRef}
              uri={urls.signinUrl}
              key="WebViewSignin"
              setCanGoBack={setCanGoBack}
              handleNavigation={handleNavigation}
              onLoadEnd={onSigninLoadEnd}
              onMessage={processMessage}
              clouderyTheme={clouderyTheme}
              disableAutofocus={
                disableAutofocus || clouderyMode !== CLOUDERY_MODE_SIGNING
              }
            />
          </View>
        )}
        {signinLoaded && (
          <View
            style={[
              styles.clouderyLoginView,
              { zIndex: clouderyMode === CLOUDERY_MODE_LOGIN ? 2 : 1 }
            ]}
            key="ViewLogin"
            testID="ViewLogin"
          >
            <ClouderyWebView
              applicationNameForUserAgent={APPLICATION_NAME_FOR_USER_AGENT}
              ref={webviewLoginRef}
              uri={urls.loginUrl}
              key="WebViewLogin"
              setCanGoBack={setCanGoBack}
              handleNavigation={handleNavigation}
              onLoadEnd={onLoginLoadEnd}
              onMessage={processMessage}
              clouderyTheme={clouderyTheme}
              disableAutofocus={
                disableAutofocus || clouderyMode !== CLOUDERY_MODE_LOGIN
              }
            />
          </View>
        )}
      </>
    )
  }
)
ClouderyViewSwitch.displayName = 'ClouderyViewSwitch'

/**
 * Display a Cloudery WebView based on provided uri
 */
const ClouderyWebView = forwardRef(
  (
    {
      clouderyTheme,
      handleNavigation,
      onMessage,
      onLoadEnd,
      setCanGoBack,
      uri,
      disableAutofocus,
      ...other
    }: ClouderyWebViewProps & WebViewProps,
    ref
  ) => {
    const webviewRef = useRef<WebView>()

    useImperativeHandle(ref, () => webviewRef.current)

    useEffect(() => {
      if (!disableAutofocus && webviewRef.current) {
        triggerAutofocusFocusOnWebview(webviewRef.current)
      }
    }, [disableAutofocus, webviewRef])

    const processMessage = (event: WebViewMessageEvent): void => {
      if (!disableAutofocus && webviewRef.current) {
        tryProcessQueryKeyboardMessage(webviewRef.current, event)
      }
      onMessage?.(event)
    }

    const handleError = async (webviewErrorEvent: unknown): Promise<void> => {
      try {
        const isOffline = await NetService.isOffline()
        isOffline &&
          NetService.handleOfflineWithCallback(() => {
            webviewRef.current?.reload() // Have to reload the webview when the user is back online or it will stay errored
            navigationRef.navigate(routes.welcome) // Go back to the welcome screen to leave the offline screen (offline screen should be refactored to be a modal)
          })
      } catch (error) {
        log.error(error)
      } finally {
        log.error(webviewErrorEvent)
      }
    }

    return (
      <SupervisedWebView
        applicationNameForUserAgent={APPLICATION_NAME_FOR_USER_AGENT}
        source={{ uri: uri }}
        ref={webviewRef}
        onNavigationStateChange={(event: WebViewNavigation): void => {
          setCanGoBack(event.canGoBack)
        }}
        onShouldStartLoadWithRequest={interceptExternalLinksAndOpenInAppBrowser(
          uri,
          [LOGIN_FLAGSHIP_URL],
          handleNavigation
        )}
        onLoadEnd={(): void => onLoadEnd()}
        onMessage={processMessage}
        onOpenWindow={openWindowWithInAppBrowser}
        injectedJavaScriptBeforeContentLoaded={run}
        style={{
          backgroundColor: clouderyTheme.backgroundColor
        }}
        onError={handleError}
        {...other}
      />
    )
  }
)
ClouderyWebView.displayName = 'WebView'

const run = `
  (function() {
    ${jsCozyGlobal()}

    ${jsLogInterception}

    ${fetchThemeOnLoad}

    ${handleAutofocusFields}

    ${jsPaddingInjection}

    return true;
  })();
`

const styles = StyleSheet.create({
  clouderyLoginView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  clouderySigninView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
})
