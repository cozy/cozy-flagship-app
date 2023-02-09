import React, { useEffect, useState, useCallback } from 'react'
import { Button, StyleSheet, View } from 'react-native'
import CookieManager from '@react-native-cookies/cookies'
import WebView from 'react-native-webview'

import Minilog from '@cozy/minilog'

const log = Minilog('WebViewIncognitoTest')

Minilog.enable()

const appUrl = 'https://xxx.cozy.works'

const cookieValue = '<INSERER_COOKIE_VALUE>'
const cookieName = '<INSERER_COOKIE_NAME>'

const setCookie = () => {
  const expireDate = new Date()
  expireDate.setFullYear(expireDate.getFullYear() + 1)

  const cookie = {
    name: cookieName,
    // expires: '27/11/2032, 16:24:06',
    value: cookieValue,
    domain: '.cozy.works',
    // expires: expireDate.toISOString(),
    // expires: '2025-05-30T12:30:00.00-05:00',
    expires: '2025-02-08T16:46:29.104Z',
    path: '/',
    version: '1',
    secure: true,
    httpOnly: true,
    sameSite: 'Lax' // This must be force to 'None' so iOS accepts to send it through "html injected" webview
  }

  CookieManager.set(appUrl, cookie, true)
}

const deleteCookie = async () => {
  // await CookieManager.clearAll(true)
  console.log('clear all')

  await CookieManager.clearByName(appUrl, cookieName, true)
  const expireDate = new Date()
  expireDate.setFullYear(expireDate.getFullYear() - 1)

  const cookie = {
    name: cookieName,
    // expires: expireDate.toISOString(),
    expires: '2010-01-01T00:00:00.00-00:00',
    // expires: '2020-05-30T12:30:00.00-05:00',
    value: cookieValue,
    domain: '.cozy.works',
    path: '/',
    version: '1',
    secure: true,
    httpOnly: true,
    sameSite: 'Lax' // This must be force to 'None' so iOS accepts to send it through "html injected" webview
  }

  CookieManager.set(appUrl, cookie, true)
  console.log('OK', expireDate.toISOString())
}

const logCookies = () => {
  CookieManager.get(appUrl).then(result => log(result))
}

export const WebViewIncognitoTest = () => {
  const [state, setState] = useState({
    key: 0,
    key2: 100
  })

  const { key, key2 } = state

  const reloadWebView = useCallback(async () => {
    log.debug('Trying to reload the WebView')

    setState(oldState => ({
      ...oldState,
      key: oldState.key + 1
    }))
  }, [])

  const reloadWebView2 = useCallback(async () => {
    log.debug('Trying to reload the WebView2')

    setState(oldState => ({
      ...oldState,
      key2: oldState.key2 + 1
    }))
  }, [])

  const saveDomain = initialRequest => {
    log.debug(
      'Get domain from this URL and add it to the clear list:',
      initialRequest.url
    )
    return true
  }

  return (
    <View style={styles.view}>
      <WebView
        key={key}
        source={{
          uri: appUrl
          // headers: {
          //   cookie:
          //     `${cookieName}=${cookieValue}`
          // }
        }}
        incognito={false}
        sharedCookiesEnabled={false}
        onShouldStartLoadWithRequest={saveDomain}
      />
      <WebView
        key={key2}
        source={{ uri: appUrl }}
        incognito={false}
        sharedCookiesEnabled={false}
      />
      <Button onPress={reloadWebView} title="Refresh" />
      <Button onPress={reloadWebView2} title="Refresh2" />
      <Button onPress={setCookie} title="Set Cookie" />
      <Button onPress={deleteCookie} title="Delete Cookie" />
      <Button onPress={logCookies} title="Log Cookie" />
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    marginBottom: 40
  }
})
