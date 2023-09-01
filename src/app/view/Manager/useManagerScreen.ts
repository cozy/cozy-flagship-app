import Minilog from 'cozy-minilog'
import { useEffect, useState } from 'react'
import type {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigation
} from 'react-native-webview/lib/WebViewTypes'

import { useClient } from 'cozy-client'
import type CozyClient from 'cozy-client'

import { parseOnboardLink } from '/app/domain/deeplinks/services/DeeplinksParserService'
import {
  ManagerScreenProps,
  ManagerViewProps
} from '/app/view/Manager/ManagerScreenTypes'
import { routes } from '/constants/routes'
import strings from '/constants/strings.json'
import { reset } from '/libs/RootNavigation'
import { NetService } from '/libs/services/NetService'
import {
  hideSplashScreen,
  showSplashScreen
} from '/app/theme/SplashScreenService'
import { useHomeStateContext } from '/screens/home/HomeStateProvider'

const log = Minilog('useManagerScreen')

const handleUniversalLink = async (
  url: string,
  client: CozyClient | null,
  setOnboardedRedirection: (value: string) => void
): Promise<void> => {
  if (client) {
    log.error(
      '[Shallowed error] handleUniversalLink should never be called if client exists'
    )
    return
  }

  const action = parseOnboardLink(url)

  if (!action) {
    return
  }

  if (action.onboardedRedirection) {
    log.debug(`Set OnboardedRedirection to ${action.onboardedRedirection}`)
    setOnboardedRedirection(action.onboardedRedirection)
  }

  log.debug(`🔗 Redirect to ${action.route} screen`)

  await hideSplashScreen()
  reset(action.route, action.params)
}

export const useManagerScreenProps = (
  props: ManagerScreenProps
): ManagerViewProps => {
  const [display, setDisplay] = useState(false)
  const client = useClient()
  const { setOnboardedRedirection } = useHomeStateContext()

  useEffect(
    function handleOffline() {
      const checkOffline = async (): Promise<void> => {
        if (await NetService.isOffline()) {
          await hideSplashScreen()
          NetService.handleOffline(routes.manager, {
            managerUrl: props.route.params?.managerUrl
          })
        } else {
          await showSplashScreen()
          setDisplay(true)
        }
      }

      void checkOffline()
    },
    [props.route.params]
  )

  const handleError = async (
    webviewErrorEvent: WebViewErrorEvent
  ): Promise<void> => {
    try {
      const isOffline = await NetService.isOffline()
      if (isOffline) {
        await hideSplashScreen()
        NetService.handleOffline(routes.manager, {
          managerUrl: props.route.params?.managerUrl
        })
      }
    } catch (error) {
      log.error(error)
    } finally {
      log.error(webviewErrorEvent)
    }
  }

  const handleHttpError = (webviewErrorEvent: WebViewHttpErrorEvent): void => {
    const { nativeEvent } = webviewErrorEvent

    log.error(nativeEvent)

    void hideSplashScreen()
    reset(routes.error, { type: strings.errorScreens.managerError })
  }

  const onShouldStartLoadWithRequest = (
    initialRequest: WebViewNavigation
  ): boolean => {
    if (initialRequest.url.startsWith(strings.UNIVERSAL_LINK_BASE)) {
      void handleUniversalLink(
        initialRequest.url,
        client,
        setOnboardedRedirection
      )
      return false
    }
    return true
  }

  return {
    display,
    handleError,
    handleHttpError,
    managerUrl: props.route.params?.managerUrl ?? '',
    onShouldStartLoadWithRequest
  }
}
