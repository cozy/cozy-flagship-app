import React from 'react'

import CozyWebView from '../../components/webviews/CozyWebView'

export const CozyAppScreen = ({route, navigation}) => {
  return (
    <CozyWebView source={{uri: route.params.href}} navigation={navigation} />
  )
}
