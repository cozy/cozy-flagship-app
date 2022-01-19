import React from 'react'
import CozyWebView from '../CozyWebView'

export const CozyAppScreen = ({route}) => {
  return <CozyWebView source={{uri: route.params.href}} />
}
