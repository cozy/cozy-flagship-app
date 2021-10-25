import React from 'react'
import CozyWebView from '../CozyWebView'

const StoreView = ({route, navigation}) => {
  return (
    <CozyWebView source={{uri: route.params.url}} navigation={navigation} />
  )
}

export default StoreView
