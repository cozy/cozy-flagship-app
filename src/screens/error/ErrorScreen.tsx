import Minilog from 'cozy-minilog'
import React, { useEffect } from 'react'
import { Linking } from 'react-native'
import { changeBarColors } from 'react-native-immersive-bars'
import { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes'

import { CozyNotFoundPage } from '/components/webviews/CozyNotFoundPage'
import { OfflinePage } from '/components/webviews/OfflinePage'
import { ManagerErrorPage } from '/components/webviews/ManagerErrorPage'
import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { routes } from '/constants/routes'
import { goBack, reset } from '/libs/RootNavigation'
import { getColors } from '/ui/colors'

const log = Minilog('ErrorScreen')

const colors = getColors()

/**
 * Typings
 */
interface ErrorScreenProps {
  route: {
    params: {
      type: string
      backgroundColor?: string
    }
  }
}

interface Source {
  html: ReturnType<(typeof HTML)[keyof typeof HTML]>
  baseUrl: ReturnType<(typeof HTML)[keyof typeof HTML]>
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
  offline: OfflinePage,
  managerError: ManagerErrorPage
}

const handlers: Handlers = {
  backButton: { call: goBack, shouldCatch: false },
  mailto: {
    call: () => Linking.openURL('mailto:contact@cozycloud.cc'),
    shouldCatch: true
  },
  reset: {
    call: () => reset(routes.welcome),
    shouldCatch: false
  }
}

const handleMessage = async (
  event: WebViewMessageEvent
): Promise<undefined[]> =>
  await Promise.all(
    Object.entries(handlers).map(async ([eventId, eventFn]) => {
      if (!event.nativeEvent.data.includes(eventId)) return undefined

      if (eventFn.shouldCatch) {
        try {
          await eventFn.call()
        } catch (error) {
          log.error(error)
        }
      }

      /**
       * We don't want to catch errors here hence the void return.
       * Doesn't even matter if the function is a Promise or not.
       */
      if (!eventFn.shouldCatch) void eventFn.call()
    })
  )

const makeSource = (route: ErrorScreenProps['route']): Source => {
  const htmlGenerator = HTML[route.params.type] as
    | undefined
    | ((backgroundColor: string) => string)

  if (!htmlGenerator) {
    throw new Error('The requested Page cannot be generated')
  }

  const backgroundColor: string =
    route.params.backgroundColor ?? colors.primaryColor
  return { html: htmlGenerator(backgroundColor), baseUrl: '' }
}

export const ErrorScreen = (props: ErrorScreenProps): JSX.Element => {
  /*
   * All error pages are in immersive mode with blue background, so we need light icons every time.
   * To err on the side of caution, we set the icon colors to white everytime this page is rendered.
   */
  useEffect(() => {
    changeBarColors(true)
  }, [])

  return (
    <SupervisedWebView
      onMessage={handleMessage}
      source={makeSource(props.route)}
      originWhitelist={['*']}
    />
  )
}
