import Minilog from 'cozy-minilog'
import type { NavigationProp } from '@react-navigation/native'
import type { RefObject } from 'react'
import type { WebView } from 'react-native-webview'
import type {
  ShouldStartLoadRequest,
  WebViewNavigation
} from 'react-native-webview/lib/WebViewTypes'

import type CozyClient from 'cozy-client'
import type { InstanceInfo } from 'cozy-client/types/types'

export const webviewUrlLog = Minilog('WebViews/UrlService')

export interface InterceptNavigationProps {
  initialRequest: ShouldStartLoadRequest
  targetUri: string
  subdomainType: 'flat' | 'nested'
  navigation: NavigationProp<Record<string, object | undefined>>
  onShouldStartLoadWithRequest: (request: WebViewNavigation) => boolean
  interceptReload: boolean
  onReloadInterception: () => void
  isFirstCall: boolean
  client: CozyClient
  setDownloadProgress: React.Dispatch<React.SetStateAction<number>>
  instanceInfo: InstanceInfo
}

export interface InterceptOpenWindowProps {
  currentUrl: string
  destinationUrl: string
  subdomainType: 'flat' | 'nested'
  navigation: NavigationProp<Record<string, object | undefined>>
  webViewForwardRef: RefObject<WebView>
}
