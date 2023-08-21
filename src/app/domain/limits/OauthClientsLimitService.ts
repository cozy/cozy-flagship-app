import { EventEmitter } from 'events'

import { navigate } from '/libs/RootNavigation'

export const OAUTH_CLIENTS_LIMIT_EXCEEDED = 'OAUTH_CLIENTS_LIMIT_EXCEEDED'

export const oauthClientLimitEventHandler = new EventEmitter()

export const showOauthClientsLimitExceeded = (): void => {
  navigate('home')
  oauthClientLimitEventHandler.emit(OAUTH_CLIENTS_LIMIT_EXCEEDED)
}
