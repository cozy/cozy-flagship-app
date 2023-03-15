import Minilog from '@cozy/minilog'
import React, { forwardRef, useImperativeHandle, useRef } from 'react'

import { routes } from '/constants/routes'
import { jsCozyGlobal } from '/components/webviews/jsInteractions/jsCozyInjection'
import { jsLogInterception } from '/components/webviews/jsInteractions/jsLogInterception'
import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { setFocusOnWebviewField } from '/libs/functions/keyboardHelper'
import { NetService } from '/libs/services/NetService'
import { getColors } from '/ui/colors'

const log = Minilog('ClouderyViewSwitchProps')

interface WebViewRef {
  goBack: () => void
}

interface NavState {
  canGoBack: boolean
}

interface ClouderyViewSwitchProps {
  handleNavigation: () => void
  setCanGoBack: (newState: boolean) => void
  uri: string
  setLoading: (newState: boolean) => void
}

interface ClouderyWebViewProps {
  handleNavigation: () => void
  onLoadEnd: () => void
  setCanGoBack: (newState: boolean) => void
  uri: string
}

export const ClouderyViewSwitch = forwardRef(
  (
    {
      handleNavigation,
      setCanGoBack,
      uri,
      setLoading
    }: ClouderyViewSwitchProps,
    ref
  ) => {
    const webviewRef = useRef<WebViewRef>()

    useImperativeHandle(ref, () => ({
      goBack(): void {
        webviewRef.current?.goBack()
      },
      setFocusOnField(): void {
        const fieldName = 'email'

        setFocusOnWebviewField(webviewRef.current, fieldName)
      }
    }))

    const onLoadEnd = (): void => {
      setLoading(false)
    }

    return (
      <ClouderyWebView
        ref={webviewRef}
        uri={uri}
        setCanGoBack={setCanGoBack}
        handleNavigation={handleNavigation}
        onLoadEnd={onLoadEnd}
      />
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

    return (
      <SupervisedWebView
        source={{ uri: uri }}
        ref={ref}
        onNavigationStateChange={(event: NavState): void => {
          setCanGoBack(event.canGoBack)
        }}
        onShouldStartLoadWithRequest={handleNavigation}
        onLoadEnd={(): void => onLoadEnd()}
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
