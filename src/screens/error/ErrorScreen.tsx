import React from 'react'
import { Linking } from 'react-native'
import { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes'

import Minilog from '@cozy/minilog'

import { CozyNotFoundPage } from '/components/webviews/CozyNotFoundPage'
import { OfflinePage } from '/components/webviews/OfflinePage'
import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { goBack } from '/libs/RootNavigation'

const log = Minilog('ErrorScreen')

/**
 * Typings
 */
interface ErrorScreenProps {
  route: { params: { type: string } }
}

interface Source {
  html: ReturnType<typeof HTML[keyof typeof HTML]>
}

type Handlers = Record<
  string,
  { call: (() => void) | (() => Promise<void>); shouldCatch: boolean }
>

/**
 * Implementations
 */
const HTML: Record<string, () => string> = {
  cozyNotFound: CozyNotFoundPage,
  offline: OfflinePage
}

const handlers: Handlers = {
  backButton: { call: goBack, shouldCatch: false },
  mailto: {
    call: () => Linking.openURL('mailto:contact@cozycloud.cc'),
    shouldCatch: true
  }
}

const handleMessage = async (
  event: WebViewMessageEvent
): Promise<undefined[]> =>
  await Promise.all(
    Object.keys(handlers).map(async eventId => {
      if (!event.nativeEvent.data.includes(eventId)) return undefined

      if (handlers[eventId].shouldCatch) {
        try {
          await handlers[eventId].call()
        } catch (error) {
          log.error(error)
        }
      }

      /**
       * We don't want to catch errors here hence the void return.
       * Doesn't even matter if the function is a Promise or not.
       */
      if (!handlers[eventId].shouldCatch) void handlers[eventId].call()
    })
  )

const makeSource = (route: ErrorScreenProps['route']): Source => {
  return { html: HTML[route.params.type]() }
}

export const ErrorScreen = (props: ErrorScreenProps): JSX.Element => (
  <SupervisedWebView
    onMessage={handleMessage}
    source={makeSource(props.route)}
  />
)
