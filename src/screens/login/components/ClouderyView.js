import React, { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'

import Minilog from '@cozy/minilog'

import strings from '/strings.json'
import { getColors } from '/theme/colors'
import { getUriFromRequest } from '/libs/functions/getUriFromRequest'
import { setFocusOnWebviewField } from '/libs/functions/keyboardHelper'
import { NetService } from '/libs/services/NetService'
import { jsCozyGlobal } from '/components/webviews/jsInteractions/jsCozyInjection'
import { jsLogInterception } from '/components/webviews/jsInteractions/jsLogInterception'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { rootCozyUrl } from 'cozy-client'

const log = Minilog('ClouderyView')

const run = `
    (function() {
      ${jsCozyGlobal()}

      ${jsLogInterception}

      return true;
    })();
  `

const handleError = async webviewErrorEvent => {
  try {
    const isOffline = await NetService.isOffline()
    isOffline && NetService.handleOffline()
  } catch (error) {
    log.error(error)
  } finally {
    log.error(webviewErrorEvent)
  }
}

/**
 * Displays the Cloudery web page where the user can log to their Cozy instance by specifying
 * an email or their instance URL
 *
 * If the user chooses the email method, then an email is sent to them and they can continue
 * the onboarding process
 *
 * If the user chooses the instance URL method, after filling the URL and clicking on `Continue`
 * then the instance data is returned to parent component through `setInstanceData()`
 *
 * @param {object} props
 * @param {setInstanceData} props.setInstanceData
 * @returns {import('react').ComponentClass}
 */
export const ClouderyView = ({ setInstanceData }) => {
  const [uri] = useState(strings.clouderyUri)
  const [loading, setLoading] = useState(true)
  const [checkInstanceData, setCheckInstanceData] = useState()
  const webviewRef = useRef()
  const colors = getColors()

  const handleNavigation = request => {
    const instance = getUriFromRequest(request)

    if (request.loading) {
      if (instance) {
        const normalizedInstance = instance.toLowerCase()
        const fqdn = new URL(normalizedInstance).host
        setCheckInstanceData({
          instance: normalizedInstance,
          fqdn
        })
        return false
      }
    }

    return true
  }

  useEffect(() => {
    const asyncCore = async () => {
      try {
        await rootCozyUrl(new URL(checkInstanceData.instance))

        setInstanceData({ ...checkInstanceData })
      } catch {
        navigate(routes.error, { type: strings.errorScreens.cozyNotFound })
      }
    }

    checkInstanceData && asyncCore()
  }, [checkInstanceData, setInstanceData])

  useEffect(() => {
    if (webviewRef && !loading) {
      setFocusOnWebviewField(webviewRef.current, 'email')
    }
  }, [loading, webviewRef])

  const Wrapper = Platform.OS === 'ios' ? View : KeyboardAvoidingView

  const [displayOverlay, setDisplayOverlay] = useState(true)

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        setDisplayOverlay(false)
      }, 1)
    }
  }, [loading])

  return (
    <Wrapper style={styles.view} behavior="height">
      <WebView
        source={{ uri: uri }}
        ref={webviewRef}
        onShouldStartLoadWithRequest={handleNavigation}
        onLoadEnd={() => setLoading(false)}
        injectedJavaScriptBeforeContentLoaded={run}
        style={{
          backgroundColor: colors.primaryColor
        }}
        onError={handleError}
      />
      {displayOverlay && (
        <View
          testID="overlay"
          style={[
            styles.loadingOverlay,
            {
              backgroundColor: colors.primaryColor
            }
          ]}
        />
      )}
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
})
