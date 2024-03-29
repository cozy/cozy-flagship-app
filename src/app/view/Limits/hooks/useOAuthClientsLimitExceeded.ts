import { NavigationProp, ParamListBase } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import type {
  WebViewOpenWindowEvent,
  WebViewNavigation
} from 'react-native-webview/lib/WebViewTypes'

import { useClient, useInstanceInfo } from 'cozy-client'
import Minilog from 'cozy-minilog'

import {
  OAUTH_CLIENTS_LIMIT_EXCEEDED,
  buildOauthClientLimitExceededUrl,
  interceptNavigation,
  interceptOpenWindow,
  oauthClientLimitEventHandler
} from '/app/domain/limits/OauthClientsLimitService'

const log = Minilog('⛔ OAuth Clients Limit Exceeded')

interface OAuthClientsLimitExceededState {
  popupUrl: string | null
  interceptNavigation: (request: WebViewNavigation) => boolean
  interceptOpenWindow: (syntheticEvent: WebViewOpenWindowEvent) => void
}

export const useOAuthClientsLimitExceeded = (
  navigation: NavigationProp<ParamListBase>
): OAuthClientsLimitExceededState => {
  const client = useClient()
  const instancesInfo = useInstanceInfo()

  const [popupUrl, setPopupUrl] = useState<string | null>(null)

  const closePopup = (): void => {
    setPopupUrl(null)
  }

  useEffect(() => {
    const eventCallback = (href: string): void => {
      const doAsync = async (): Promise<void> => {
        if (client === null) {
          log.error('Client is null, should not happen')
          return
        }

        const popupUrl = await buildOauthClientLimitExceededUrl(href, client)

        setPopupUrl(current => current ?? popupUrl)
      }

      void doAsync()
    }

    const subscription = oauthClientLimitEventHandler.addListener(
      OAUTH_CLIENTS_LIMIT_EXCEEDED,
      eventCallback
    )

    return (): void => {
      subscription.removeListener(OAUTH_CLIENTS_LIMIT_EXCEEDED, eventCallback)
    }
  }, [client])

  return {
    popupUrl,
    interceptNavigation: interceptNavigation(
      popupUrl ?? '',
      closePopup,
      client,
      navigation,
      instancesInfo
    ),
    interceptOpenWindow: interceptOpenWindow(client, navigation, instancesInfo)
  }
}
