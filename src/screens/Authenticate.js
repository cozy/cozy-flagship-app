import React from 'react'
import {CozyWebView} from 'react-native-webview'

import strings from '../strings.json'
import {useAuthenticate} from '../hooks/useAuthenticate'

export const Authenticate = ({setClient}) => {
  const {onShouldStartLoadWithRequest} = useAuthenticate(setClient)

  return (
    <CozyWebView
      source={{uri: strings.loginUri}}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
    />
  )
}
