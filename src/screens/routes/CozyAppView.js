import React from 'react'
import CozyWebView from '../CozyWebView'

export const CozyAppView = ({route}) => {
  return <CozyWebView source={{uri: route.params.href}} />
}
