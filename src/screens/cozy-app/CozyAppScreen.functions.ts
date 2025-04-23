import { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes'

import { routes } from '/constants/routes'
import { NetService } from '/libs/services/NetService'

export const handleError = ({ nativeEvent }: WebViewErrorEvent): void => {
  const { code, description } = nativeEvent

  if (code === -2 && description === 'net::ERR_INTERNET_DISCONNECTED')
    NetService.handleOffline(routes.home)
}
