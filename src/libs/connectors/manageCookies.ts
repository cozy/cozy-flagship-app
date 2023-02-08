import CookieManager from '@react-native-cookies/cookies'
import { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes'
import { store } from '/redux/store'

import {
  clearList,
  removeUrlFromStore,
  selectConnectorUrls,
  updateList
} from '/redux/ConnectorState/ConnectorUrlsSlice'
import { logger } from '/libs/functions/logger'

export const _stateManager = {
  pushToStore: (url: string): void => {
    store.dispatch(updateList(url))
  },
  getFromStore: (): string[] => {
    const { urls } = selectConnectorUrls(store.getState())

    return urls
  },
  cleanStore: (): void => {
    store.dispatch(clearList())
  },
  removeUrlFromStore: (url: string): void => {
    store.dispatch(removeUrlFromStore(url))
  }
}

export const handleWorkerStartRequest = (
  event: ShouldStartLoadRequest
): boolean => {
  const { url } = event

  _stateManager.pushToStore(url)

  return true
}

export const cleanConnectorCookies = async (
  connectorUrl: string
): Promise<void> => {
  const cookies = await CookieManager.get(connectorUrl)

  for (const cookie of Object.values(cookies)) {
    // Can't remove them directly, so we set them to expire in the past
    await CookieManager.set(connectorUrl, {
      ...cookie,
      expires: 'Thu, 01 Jan 1970 00:00:00 GMT'
    })
  }

  _stateManager.removeUrlFromStore(connectorUrl)
}

export const cleanAllConnectorCookies = async (): Promise<void> => {
  const urls = _stateManager.getFromStore()

  /**
   * We don't want to stop the process if one of the cookies fails to be removed.
   * As the CookieManager deals with native code, it's possible that the process
   * fails for some reason.
   */
  try {
    for (const url of urls) {
      await cleanConnectorCookies(url)
    }
  } catch (error) {
    logger('manageCookies').error(error)
  }

  _stateManager.cleanStore()
}
