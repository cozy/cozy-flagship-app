import React from 'react'
import CozyWebView from '../../components/webviews/CozyWebView'

export const CozyAppScreen = ({route}) => {
  return <CozyWebView source={{uri: route.params.href}} />
}
