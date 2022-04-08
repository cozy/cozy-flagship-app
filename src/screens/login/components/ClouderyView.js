import React, {useEffect, useState} from 'react'
import {WebView} from 'react-native-webview'

import strings from '../../../strings.json'
import {getUriFromRequest} from '../../../libs/functions/getUriFromRequest'

const isLoginPage = requestUrl => {
  const url = new URL(requestUrl)

  return url.pathname === '/v2/cozy/login'
}

const isOnboardPage = requestUrl => {
  const url = new URL(requestUrl)

  return url.pathname === '/v2/cozy/onboard'
}

/**
 * Displays the Cloudery web page where the user can specify their Cozy instance
 *
 * If the user clicks on `Continue` then the instance data is returned to parent component
 * through `setInstanceData()`
 *
 * If the user clicks on `I haven't a Cozy` then the user is redirected to `OnboardingScreen`
 *
 * @param {object} props
 * @param {setInstanceData} props.setInstanceData
 * @returns {import("react").ComponentClass}
 */
export const ClouderyView = ({setInstanceData}) => {
  // const [uri, setUri] = useState(strings.loginUri)
  const [uri, setUri] = useState('http://localhost:5757/')
  const [show, setShow] = useState(false)

  useEffect(() => {
    console.log('♻️ use effect')
    setTimeout(() => {
      console.log('♻️ set timeout')
      setShow(true)
    }, 5000)
  }, [])

  // const handleNavigation = request => {
  //   if (request.loading) {
  //     if (isLoginPage(request.url) && request.url !== strings.loginUri) {
  //       setUri(strings.loginUri)
  //       return false
  //     }
  //
  //     if (isOnboardPage(request.url) && request.url !== strings.onboardingUri) {
  //       setUri(strings.onboardingUri)
  //       return false
  //     }
  //
  //     const instance = getUriFromRequest(request)
  //     if (instance) {
  //       const fqdn = new URL(instance).host
  //       setInstanceData({
  //         instance,
  //         fqdn,
  //       })
  //       return false
  //     }
  //   }
  //
  //   return true
  // }

  return (
    show && (
      <WebView
        source={{uri: uri}}
        // onShouldStartLoadWithRequest={handleNavigation}
      />
    )
  )
}
