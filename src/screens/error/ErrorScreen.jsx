import React from 'react'
import { Linking } from 'react-native'

import { CozyNotFoundPage } from '/components/webviews/CozyNotFoundPage'
import { OfflinePage } from '/components/webviews/OfflinePage'
import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { goBack } from '/libs/RootNavigation'

const HTML = {
  cozyNotFound: CozyNotFoundPage,
  offline: OfflinePage
}

const handlers = {
  backButton: () => goBack(),
  mailto: () => Linking.openURL('mailto:contact@cozycloud.cc')
}

const handleMessage = ({ nativeEvent: { data } }) =>
  Object.keys(handlers).forEach(
    eventId => data?.includes(eventId) && handlers[eventId]()
  )

const makeSource = route => ({
  html: HTML[route?.params?.type]?.() ?? OfflinePage
})

export const ErrorScreen = ({ route }) => (
  <SupervisedWebView onMessage={handleMessage} source={makeSource(route)} />
)
