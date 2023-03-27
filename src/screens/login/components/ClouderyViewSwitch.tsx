import Minilog from '@cozy/minilog'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import { StyleSheet, View } from 'react-native'
import type { WebView, WebViewNavigation } from 'react-native-webview'
import type { WebViewOpenWindowEvent } from 'react-native-webview/lib/WebViewTypes'

import { routes } from '/constants/routes'
import { jsCozyGlobal } from '/components/webviews/jsInteractions/jsCozyInjection'
import { jsLogInterception } from '/components/webviews/jsInteractions/jsLogInterception'
import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { showInAppBrowser } from '/libs/intents/InAppBrowser'
import { setFocusOnWebviewField } from '/libs/functions/keyboardHelper'
import { NetService } from '/libs/services/NetService'
import { ClouderyUrls } from '/screens/login/cloudery-env/clouderyEnv'
import { getColors } from '/ui/colors'

const log = Minilog('ClouderyViewSwitchProps')

export const CLOUDERY_MODE_LOGIN = 'CLOUDERY_MODE_LOGIN'
export const CLOUDERY_MODE_SIGNING = 'CLOUDERY_MODE_SIGNING'

const LOGIN_FLAGSHIP_URL = 'https://loginflagship'

interface ClouderyViewSwitchProps {
  clouderyMode: 'CLOUDERY_MODE_LOGIN' | 'CLOUDERY_MODE_SIGNING'
  handleNavigation: (request: WebViewNavigation) => boolean
  setCanGoBack: (newState: boolean) => void
  urls: ClouderyUrls
  setLoading: (newState: boolean) => void
}

interface ClouderyWebViewProps {
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
      clouderyMode,
      handleNavigation,
      setCanGoBack,
      urls,
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
      handleNavigation,
      onLoadEnd,
      setCanGoBack,
      uri,
      ...other
    }: ClouderyWebViewProps,
    ref
  ) => {
    const colors = getColors()

    const localHandleNavigation = (request: WebViewNavigation): boolean => {
      const baseUrl = new URL(uri)
      const targetUrl = new URL(request.url)

      if (
        baseUrl.origin !== targetUrl.origin &&
        targetUrl.origin !== LOGIN_FLAGSHIP_URL
      ) {
        void showInAppBrowser({ url: request.url })
        return false
      }

      return handleNavigation(request)
    }

    return (
      <SupervisedWebView
        source={{ uri: uri }}
        ref={ref}
        onNavigationStateChange={(event: WebViewNavigation): void => {
          setCanGoBack(event.canGoBack)
        }}
        onShouldStartLoadWithRequest={localHandleNavigation}
        onLoadEnd={(): void => onLoadEnd()}
        onOpenWindow={(syntheticEvent: WebViewOpenWindowEvent): void => {
          const { nativeEvent } = syntheticEvent
          void showInAppBrowser({ url: nativeEvent.targetUrl })
        }}
        injectedJavaScriptBeforeContentLoaded={run}
        style={{
          backgroundColor: colors.primaryColor
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

      return true;
    })();
  `

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
