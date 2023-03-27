import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View
} from 'react-native'

import { rootCozyUrl } from 'cozy-client'

import strings from '/constants/strings.json'
import { getUriFromRequest } from '/libs/functions/getUriFromRequest'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { useClouderyUrl } from '/screens/login/cloudery-env/useClouderyUrl'
import { ClouderyViewSwitch } from '/screens/login/components/ClouderyViewSwitch'
import {
  isOidcNavigationRequest,
  processOIDC
} from '/screens/login/components/functions/oidc'

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
export const ClouderyView = ({
  backgroundColor,
  clouderyMode,
  setInstanceData,
  disabledFocus,
  setBackgroundColor,
  setError,
  startOidcOAuth,
  startOidcOnboarding
}) => {
  const { urls } = useClouderyUrl()
  const [loading, setLoading] = useState(true)
  const [checkInstanceData, setCheckInstanceData] = useState()
  const webviewRef = useRef()
  const [canGoBack, setCanGoBack] = useState(false)

  const handleNavigation = request => {
    if (request.loading) {
      const instance = getUriFromRequest(request)

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

    const isOidc = isOidcNavigationRequest(request)
    if (isOidc) {
      processOIDC(request)
        .then(oidcResult => {
          if (oidcResult.fqdn) {
            startOidcOAuth(oidcResult.fqdn, oidcResult.code)
          } else if (oidcResult.onboardUrl) {
            startOidcOnboarding(oidcResult.onboardUrl, oidcResult.code)
          }
          return
        })
        .catch(error => {
          if (error !== 'USER_CANCELED') {
            setError(error.message, error)
          }
        })
      return false
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
    // add a parameter
    if (
      webviewRef &&
      !loading &&
      !disabledFocus &&
      !urls?.isOnboardingPartner
    ) {
      webviewRef.current.setFocusOnField()
    }
  }, [
    clouderyMode,
    loading,
    webviewRef,
    disabledFocus,
    urls?.isOnboardingPartner
  ])

  const handleBackPress = useCallback(() => {
    if (!canGoBack) {
      return false
    }

    webviewRef.current.goBack()
    return true
  }, [canGoBack, webviewRef])

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress)

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
  }, [handleBackPress])

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
      {urls && (
        <ClouderyViewSwitch
          clouderyMode={clouderyMode}
          handleNavigation={handleNavigation}
          ref={webviewRef}
          setCanGoBack={setCanGoBack}
          setLoading={setLoading}
          urls={urls}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
        />
      )}
      {displayOverlay && (
        <View
          testID="overlay"
          style={[
            styles.loadingOverlay,
            {
              backgroundColor: backgroundColor
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
    bottom: 0,
    zIndex: 10
  }
})
