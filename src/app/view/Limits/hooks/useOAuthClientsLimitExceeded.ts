import { useEffect, useState } from 'react'

import { useClient } from 'cozy-client'
import Minilog from 'cozy-minilog'

import {
  OAUTH_CLIENTS_LIMIT_EXCEEDED,
  oauthClientLimitEventHandler
} from '/app/domain/limits/OauthClientsLimitService'

const log = Minilog('⛔ OAuth Clients Limit Exceeded')

const OAUTH_CLIENTS_LIMIT_EXCEEDED_URL_PATH = '/settings/clients/limit-exceeded'

interface OAuthClientsLimitExceededState {
  popupUrl: string | null
}

export const useOAuthClientsLimitExceeded =
  (): OAuthClientsLimitExceededState => {
    const client = useClient()

    const [popupUrl, setPopupUrl] = useState<string | null>(null)

    useEffect(() => {
      const eventCallback = (): void => {
        if (client === null) {
          log.error('Client is null, should not happen')
          return
        }

        const rootURL = client.getStackClient().uri
        setPopupUrl(`${rootURL}${OAUTH_CLIENTS_LIMIT_EXCEEDED_URL_PATH}`)
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
      popupUrl
    }
  }
