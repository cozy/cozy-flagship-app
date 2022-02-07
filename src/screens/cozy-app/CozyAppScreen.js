import React, {useEffect, useState} from 'react'
import {useNativeIntent} from 'cozy-intent'

import CozyWebView from '../../components/webviews/CozyWebView'

export const CozyAppScreen = ({route, navigation}) => {
  const [ref, setRef] = useState('')
  const nativeIntent = useNativeIntent()

  useEffect(() => {
    if (ref) {
      nativeIntent.registerWebview(ref)
    }

    return () => {
      if (ref) {
        nativeIntent.unregisterWebview(ref)
      }
    }
  }, [nativeIntent, ref])

  return (
    <CozyWebView
      source={{uri: route.params.href}}
      navigation={navigation}
      setRef={setRef}
      onMessage={async m => {
        nativeIntent.tryEmit(m)
      }}
    />
  )
}
