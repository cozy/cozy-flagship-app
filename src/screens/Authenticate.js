import React from 'react'
import {WebView} from 'react-native-webview'

import strings from '../strings.json'
import {useAuthenticate} from '../hooks/useAuthenticate'

export const Authenticate = ({navigation, setClient}) => {
  const {onShouldStartLoadWithRequest} = useAuthenticate(navigation, setClient)

  return (
    <WebView
      source={{uri: strings.loginUri}}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
    />
  )
}
