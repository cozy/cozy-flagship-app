import { NavigationProp, ParamListBase } from '@react-navigation/native'
import type {
  WebViewOpenWindowEvent,
  WebViewNavigation
} from 'react-native-webview/lib/WebViewTypes'

import CozyClient from 'cozy-client'
import { InstanceInfo } from 'cozy-client/types/types'

import {
  clouderyOfferEventHandler,
  CLOUDERY_OFFER
} from '/app/domain/iap/services/clouderyOffer'
import {
  interceptNavigation,
  interceptOpenWindow
} from '/app/domain/limits/OauthClientsLimitService'
import { routes } from '/constants/routes'
import { navigateToApp } from '/libs/functions/openApp'
import { navigationRef } from '/libs/RootNavigation'

jest.mock('/libs/functions/openApp')

const mockNavigationProp = {} as NavigationProp<ParamListBase>

const mockClient = (): CozyClient => {
  return {
    getStackClient: (): { uri: string } => ({
      uri: 'http://claude.mycozy.cloud'
    }),
    capabilities: { flat_subdomains: true }
  } as CozyClient
}

const mockWebViewNavigationRequest = (url: string): WebViewNavigation => {
  return {
    url: url
  } as WebViewNavigation
}

const mockOpenWindowRequest = (url: string): WebViewOpenWindowEvent => {
  return {
    nativeEvent: {
      targetUrl: url
    }
  } as WebViewOpenWindowEvent
}

const mockCurrentRouteName = (currentRouteName: string): void => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  navigationRef.current = {
    getCurrentRoute: jest.fn().mockReturnValue({ name: currentRouteName })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

describe('interceptNavigation', () => {
  let mockClouderyOfferEventHandler: () => void
  beforeEach(() => {
    mockClouderyOfferEventHandler = jest.fn()
  })

  it('should do nothing if client is null', () => {
    const initialUrl = 'SOME_URL'
    const destinationUrl = 'SOME_DESTINATION_URL'

    const client = null
    const closePopup = jest.fn()
    const navigationRequest = mockWebViewNavigationRequest(destinationUrl)

    const instanceInfo = getFakeContext()

    const allowNavigation = interceptNavigation(
      initialUrl,
      closePopup,
      client,
      mockNavigationProp,
      instanceInfo
    )(navigationRequest)

    expect(allowNavigation).toBe(false)
    expect(closePopup).not.toHaveBeenCalled()
    expect(navigateToApp).not.toHaveBeenCalled()
  })

  it('should close the OAuthClientLimit popup when redirected to Home', () => {
    const initialUrl =
      'http://claude.mycozy.cloud/settings/clients/limit-exceeded?redirect=http%3A%2F%2Fclaude-home.mycozy.cloud%2F'
    const destinationUrl = 'http://claude-home.mycozy.cloud/'

    const client = mockClient()
    const closePopup = jest.fn()
    const navigationRequest = mockWebViewNavigationRequest(destinationUrl)

    const instanceInfo = getFakeContext()

    mockCurrentRouteName(routes.default)

    const allowNavigation = interceptNavigation(
      initialUrl,
      closePopup,
      client,
      mockNavigationProp,
      instanceInfo
    )(navigationRequest)

    expect(allowNavigation).toBe(false)
    expect(closePopup).toHaveBeenCalled()
    expect(navigateToApp).not.toHaveBeenCalled()
  })

  it('should close the OAuthClientLimit popup and navigate to drive when redirected to a cozy-drive url', () => {
    const initialUrl =
      'http://claude.mycozy.cloud/settings/clients/limit-exceeded?redirect=http%3A%2F%2Fclaude-drive.mycozy.cloud%2F'
    const destinationUrl = 'http://claude-drive.mycozy.cloud/'

    const client = mockClient()
    const closePopup = jest.fn()
    const navigationRequest = mockWebViewNavigationRequest(destinationUrl)

    const instanceInfo = getFakeContext()

    mockCurrentRouteName(routes.default)

    const allowNavigation = interceptNavigation(
      initialUrl,
      closePopup,
      client,
      mockNavigationProp,
      instanceInfo
    )(navigationRequest)

    expect(allowNavigation).toBe(false)
    expect(closePopup).toHaveBeenCalled()
    expect(navigateToApp).toHaveBeenCalledWith({
      href: 'http://claude-drive.mycozy.cloud/',
      slug: 'drive',
      navigation: mockNavigationProp
    })
  })

  it('should close the OAuthClientLimit popup but not navigate to drive when redirected to a cozy-drive url while in cozy-settings', () => {
    const initialUrl =
      'http://claude.mycozy.cloud/settings/clients/limit-exceeded?redirect=http%3A%2F%2Fclaude-drive.mycozy.cloud%2F'
    const destinationUrl = 'http://claude-drive.mycozy.cloud/'

    const client = mockClient()
    const closePopup = jest.fn()
    const navigationRequest = mockWebViewNavigationRequest(destinationUrl)

    const instanceInfo = getFakeContext()

    mockCurrentRouteName(routes.cozyapp)

    const allowNavigation = interceptNavigation(
      initialUrl,
      closePopup,
      client,
      mockNavigationProp,
      instanceInfo
    )(navigationRequest)

    expect(allowNavigation).toBe(false)
    expect(closePopup).toHaveBeenCalled()
    expect(navigateToApp).not.toHaveBeenCalled()
  })

  it('should allow navigation in case of refresh', () => {
    const initialUrl =
      'http://claude.mycozy.cloud/settings/clients/limit-exceeded?redirect=http%3A%2F%2Fclaude-drive.mycozy.cloud%2F'
    const destinationUrl = initialUrl

    const client = mockClient()
    const closePopup = jest.fn()
    const navigationRequest = mockWebViewNavigationRequest(destinationUrl)

    const instanceInfo = getFakeContext()

    mockCurrentRouteName(routes.default)

    const allowNavigation = interceptNavigation(
      initialUrl,
      closePopup,
      client,
      mockNavigationProp,
      instanceInfo
    )(navigationRequest)

    expect(allowNavigation).toBe(true)
    expect(closePopup).not.toHaveBeenCalled()
    expect(navigateToApp).not.toHaveBeenCalled()
  })

  it('should allow navigation in case of refresh (resilient to trailing hash)', () => {
    const initialUrl =
      'http://claude.mycozy.cloud/settings/clients/limit-exceeded?redirect=http%3A%2F%2Fclaude-drive.mycozy.cloud%2F'
    const destinationUrl = `${initialUrl}#`

    const client = mockClient()
    const closePopup = jest.fn()
    const navigationRequest = mockWebViewNavigationRequest(destinationUrl)

    const instanceInfo = getFakeContext()

    mockCurrentRouteName(routes.default)

    const allowNavigation = interceptNavigation(
      initialUrl,
      closePopup,
      client,
      mockNavigationProp,
      instanceInfo
    )(navigationRequest)

    expect(allowNavigation).toBe(true)
    expect(closePopup).not.toHaveBeenCalled()
    expect(navigateToApp).not.toHaveBeenCalled()
  })

  it('should be error safe and interrupt navigation if any', () => {
    const initialUrl =
      'http://claude.mycozy.cloud/settings/clients/limit-exceeded?redirect=http%3A%2F%2Fclaude-drive.mycozy.cloud%2F'
    const destinationUrl = 'http://claude-drive.mycozy.cloud/'

    const client = mockClient()
    const closePopup = jest.fn()
    const navigationRequest = mockWebViewNavigationRequest(destinationUrl)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    navigationRef.current = {
      getCurrentRoute: jest.fn().mockImplementation(() => {
        throw new Error('SOME_ERROR')
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    const instanceInfo = getFakeContext()

    const allowNavigation = interceptNavigation(
      initialUrl,
      closePopup,
      client,
      mockNavigationProp,
      instanceInfo
    )(navigationRequest)

    expect(allowNavigation).toBe(false)
    expect(closePopup).not.toHaveBeenCalled()
    expect(navigateToApp).not.toHaveBeenCalled()
  })

  it('should intercept ClouderyOffer url', () => {
    const initialUrl =
      'http://claude.mycozy.cloud/settings/clients/limit-exceeded?redirect=http%3A%2F%2Fclaude-drive.mycozy.cloud%2F'
    const destinationUrl =
      'https://manager.cozycloud.cc/cozy/instances/SOME_UUID/premium'

    const client = mockClient()
    const closePopup = jest.fn()
    const navigationRequest = mockWebViewNavigationRequest(destinationUrl)
    clouderyOfferEventHandler.on(CLOUDERY_OFFER, mockClouderyOfferEventHandler)

    const instanceInfo = getFakeContext()

    const allowNavigation = interceptNavigation(
      initialUrl,
      closePopup,
      client,
      mockNavigationProp,
      instanceInfo
    )(navigationRequest)

    expect(allowNavigation).toBe(false)
    expect(closePopup).not.toHaveBeenCalled()
    expect(navigateToApp).not.toHaveBeenCalled()
    expect(mockClouderyOfferEventHandler).toHaveBeenCalledWith(
      'https://manager.cozycloud.cc/cozy/instances/SOME_UUID/premium?iap_vendor=ios&iap_url=https%3A%2F%2Fiapflagship'
    )
  })
})

describe('interceptOpenWindow', () => {
  it('should do nothing if client is null', () => {
    const targetUrl = 'SOME_DESTINATION_URL'

    const client = null
    const openWindowRequest = mockOpenWindowRequest(targetUrl)

    interceptOpenWindow(client, mockNavigationProp)(openWindowRequest)

    expect(navigateToApp).not.toHaveBeenCalled()
  })

  it('should open cozy-settings when called with corresponding url', () => {
    const targetUrl = 'http://claude-settings.mycozy.cloud/#/connectedDevices'

    const client = mockClient()
    const openWindowRequest = mockOpenWindowRequest(targetUrl)

    interceptOpenWindow(client, mockNavigationProp)(openWindowRequest)

    expect(navigateToApp).toHaveBeenCalledWith({
      href: 'http://claude-settings.mycozy.cloud/#/connectedDevices',
      slug: 'settings',
      navigation: mockNavigationProp
    })
  })

  it('should be error safe', () => {
    const targetUrl = 'http://claude-settings.mycozy.cloud/#/connectedDevices'

    const client = mockClient()
    const openWindowRequest = mockOpenWindowRequest(targetUrl)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    ;(navigateToApp as any).mockImplementation(() => {
      throw new Error('SOME_ERROR')
    })

    interceptOpenWindow(client, mockNavigationProp)(openWindowRequest)

    expect(true).toBe(true)
  })
})

const getFakeContext = (): InstanceInfo => {
  return {
    context: {
      data: {
        manager_url: 'https://manager.cozycloud.cc'
      }
    },
    instance: {
      data: {
        uuid: 'SOME_UUID'
      }
    }
  } as unknown as InstanceInfo
}
