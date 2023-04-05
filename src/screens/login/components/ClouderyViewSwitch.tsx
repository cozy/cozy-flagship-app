import Minilog from '@cozy/minilog'
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
import { setFocusOnWebviewField } from '/libs/functions/keyboardHelper'
import { NetService } from '/libs/services/NetService'
import { ClouderyUrls } from '/screens/login/cloudery-env/clouderyEnv'
import {
  fetchBackgroundOnLoad,
  tryProcessClouderyBackgroundMessage
} from '/screens/login/components/functions/clouderyBackgroundFetcher'
import {
  interceptExternalLinksAndOpenInAppBrowser,
  openWindowWithInAppBrowser
} from '/screens/login/components/functions/interceptExternalLinks'
import { LOGIN_FLAGSHIP_URL } from '/screens/login/components/functions/oidc'

const log = Minilog('ClouderyViewSwitchProps')

export const CLOUDERY_MODE_LOGIN = 'CLOUDERY_MODE_LOGIN'
export const CLOUDERY_MODE_SIGNING = 'CLOUDERY_MODE_SIGNING'

interface ClouderyViewSwitchProps {
  backgroundColor: string
  clouderyMode: 'CLOUDERY_MODE_LOGIN' | 'CLOUDERY_MODE_SIGNING'
  handleNavigation: (request: WebViewNavigation) => boolean
  setCanGoBack: (newState: boolean) => void
  urls: ClouderyUrls
  setBackgroundColor: (color: string) => void
  setLoading: (newState: boolean) => void
}

interface ClouderyWebViewProps {
  backgroundColor: string
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
      backgroundColor,
      clouderyMode,
      handleNavigation,
      setCanGoBack,
      urls,
      setBackgroundColor,
      setLoading
    }: ClouderyViewSwitchProps,
    ref
  ) => {
    const webviewLoginRef = useRef<WebView>()
    const webviewSigninRef = useRef<WebView>()
    const [loginLoaded, setLoginLoaded] = useState(false)
    const [signinLoaded, setSigninLoaded] = useState(false)

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
      },
      setFocusOnField(): void {
        const fieldName =
          clouderyMode === CLOUDERY_MODE_LOGIN ? 'email' : 'postcode'

        setFocusOnWebviewField(webviewLoginRef.current, fieldName)
      }
    }))

    const onSigninLoadEnd = (): void => {
      setSigninLoaded(true)
    }

    const onLoginLoadEnd = (): void => {
      setLoginLoaded(true)

      if (urls.isOnboardingPartner) {
        setSigninLoaded(true)
      }
    }

    const processMessage = (event: WebViewMessageEvent): void => {
      tryProcessClouderyBackgroundMessage(event, setBackgroundColor)
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
              ref={webviewSigninRef}
              uri={urls.signinUrl}
              key="WebViewSignin"
              setCanGoBack={setCanGoBack}
              handleNavigation={handleNavigation}
              onLoadEnd={onSigninLoadEnd}
              onMessage={processMessage}
              backgroundColor={backgroundColor}
            />
          </View>
        )}
        <View
          style={[
            styles.clouderyLoginView,
            { zIndex: clouderyMode === CLOUDERY_MODE_LOGIN ? 2 : 1 }
          ]}
          key="ViewLogin"
          testID="ViewLogin"
        >
          <ClouderyWebView
            ref={webviewLoginRef}
            uri={urls.loginUrl}
            key="WebViewLogin"
            setCanGoBack={setCanGoBack}
            handleNavigation={handleNavigation}
            onLoadEnd={onLoginLoadEnd}
            onMessage={processMessage}
            backgroundColor={backgroundColor}
          />
        </View>
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
      backgroundColor,
      handleNavigation,
      onLoadEnd,
      setCanGoBack,
      uri,
      ...other
    }: ClouderyWebViewProps & WebViewProps,
    ref
  ) => {
    return (
      <SupervisedWebView
        source={{ uri: uri }}
        ref={ref}
        onNavigationStateChange={(event: WebViewNavigation): void => {
          setCanGoBack(event.canGoBack)
        }}
        onShouldStartLoadWithRequest={interceptExternalLinksAndOpenInAppBrowser(
          uri,
          [LOGIN_FLAGSHIP_URL],
          handleNavigation
        )}
        onLoadEnd={(): void => onLoadEnd()}
        onOpenWindow={openWindowWithInAppBrowser}
        injectedJavaScriptBeforeContentLoaded={run}
        style={{
          backgroundColor: backgroundColor
        }}
        onError={handleError}
        {...other}
      />
    )
  }
)
ClouderyWebView.displayName = 'WebView'

const run =
  `
    (function() {
      ${jsCozyGlobal()}

      ${jsLogInterception}

      return true;
    })();
  ` + fetchBackgroundOnLoad

const handleError = async (webviewErrorEvent: unknown): Promise<void> => {
  try {
    const isOffline = await NetService.isOffline()
    isOffline && NetService.handleOffline(routes.onboarding)
  } catch (error) {
    log.error(error)
  } finally {
    log.error(webviewErrorEvent)
  }
}

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
