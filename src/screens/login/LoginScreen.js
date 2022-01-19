import React from 'react'
import {WebView} from 'react-native-webview'

import strings from '../../strings.json'
import {useAuthenticate} from '../../hooks/useAuthenticate'

export const LoginScreen = ({setClient}) => {
  const {onShouldStartLoadWithRequest} = useAuthenticate(setClient)

  return (
    <WebView
      source={{uri: strings.loginUri}}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
    />
  )
}
