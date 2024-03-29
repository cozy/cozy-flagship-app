import { RouteProp } from '@react-navigation/native'
import type {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigation
} from 'react-native-webview/lib/WebViewTypes'

type RootStackParamList = Record<string, undefined | { managerUrl: string }>

export interface ManagerScreenProps {
  route: RouteProp<RootStackParamList, 'manager'>
}

export interface ManagerViewProps {
  display: boolean
  handleError: (webviewErrorEvent: WebViewErrorEvent) => Promise<void>
  handleHttpError: (event: WebViewHttpErrorEvent) => void
  managerUrl: string
  onShouldStartLoadWithRequest: (initialRequest: WebViewNavigation) => boolean
}
