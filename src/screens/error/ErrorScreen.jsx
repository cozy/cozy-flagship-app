import React from 'react'
import WebView from 'react-native-webview'

import { OfflinePage } from '../../components/webviews/OfflinePage'

const HTML = {
  offline: OfflinePage
}

export const ErrorScreen = ({ route: { params } }) => (
  <WebView source={{ html: params?.type ? HTML[params.type] : OfflinePage }} />
)
