import { act } from '@testing-library/react-native'
import { Linking } from 'react-native'

import { showInAppBrowser } from '/libs/intents/InAppBrowser'

import { isOidcNavigationRequest, processOIDC } from './oidc'

const listeners = []
const mockRemove = jest.fn().mockImplementation(listener => {
  return () => {
    const index = listeners.findIndex(l => l === listener)
    listeners.splice(index, 1)
  }
})
jest.mock('react-native', () => {
  return {
    Linking: {
      addEventListener: jest.fn((event, handler) => {
        const listener = { event, handler }
        listeners.push(listener)

        return { remove: mockRemove(listener) }
      }),
      emit: jest.fn((event, props) => {
        listeners.filter(l => l.event === event).forEach(l => l.handler(props))
      })
    },
    Platform: {
      OS: 'ios'
    }
  }
})

jest.mock('/libs/intents/InAppBrowser', () => {
  return {
    showInAppBrowser: jest.fn().mockResolvedValue({ type: 'SOME_TYPE' }),
    closeInAppBrowser: jest.fn()
  }
})

describe('OIDC', () => {
  describe('isOidcNavigationRequest', () => {
    it(`Should return true if url has 'oidc=true' param`, async () => {
      const request = {
        isTopFrame: true,
        loading: false,
        navigationType: 'click',
        title: 'Cozy Cloud',
        url: 'http://localhost:3000/grdlyon/oidc?offer=ecolyo&oidc=true'
      }

      const result = isOidcNavigationRequest(request)

      expect(result).toBe(true)
    })
    it(`Should return true if url has 'oidc' param`, async () => {
      const request = {
        isTopFrame: true,
        loading: false,
        navigationType: 'click',
        title: 'Cozy Cloud',
        url: 'http://localhost:3000/grdlyon/oidc?offer=ecolyo&oidc'
      }

      const result = isOidcNavigationRequest(request)

      expect(result).toBe(true)
    })
    it(`Should return false if url has no 'oidc' param`, async () => {
      const request = {
        isTopFrame: true,
        loading: false,
        navigationType: 'click',
        title: 'Cozy Cloud',
        url: 'http://localhost:3000/grdlyon/oidc?offer=ecolyo'
      }

      const result = isOidcNavigationRequest(request)

      expect(result).toBe(false)
    })
    it(`Should return false if url has 'oidc=false' param`, async () => {
      const request = {
        isTopFrame: true,
        loading: false,
        navigationType: 'click',
        title: 'Cozy Cloud',
        url: 'http://localhost:3000/grdlyon/oidc?offer=ecolyo&oidc=false'
      }

      const result = isOidcNavigationRequest(request)

      expect(result).toBe(false)
    })
    it('Should return false if url is an OIDC result url', async () => {
      const request = {
        isTopFrame: true,
        loading: true,
        navigationType: 'reload',
        title: 'Cozy Cloud',
        url: 'https://cozy.io/onboarding?flagship=true&code=5d6fa981cc37e18eb0a9ba14&fqdn=joseph.cozy.tools%3A8080'
      }

      const result = isOidcNavigationRequest(request)

      expect(result).toBe(false)
    })
  })

  describe('processOIDC', () => {
    it('Should open InAppBrowser and intercept Onboarding URL', async () => {
      const request = {
        isTopFrame: true,
        loading: false,
        navigationType: 'click',
        title: 'Cozy Cloud',
        url: 'http://some-oidc-server.fr/oidc?offer=ecolyo&oidc=true'
      }

      const promise = processOIDC(request)

      act(() => {
        Linking.emit('url', {
          url: 'cozy://oidc_result?code=SOME_OIDC_CODE&onboard_url=https%3A%2F%2Fmanager.cozycloud.cc%2Fsomepartner%2Fonboard%3Fonboarding_id%3DSOME_ONBOARDING_ID'
        })
      })

      const result = await promise

      expect(showInAppBrowser).toHaveBeenCalledWith({
        url: 'http://some-oidc-server.fr/oidc?offer=ecolyo&oidc=true&redirect_after_oidc=cozy%3A%2F%2Fflagship%2Foidc_result'
      })
      expect(result).toStrictEqual({
        code: 'SOME_OIDC_CODE',
        onboardUrl:
          'https://manager.cozycloud.cc/somepartner/onboard?onboarding_id=SOME_ONBOARDING_ID'
      })
    })

    it('Should open InAppBrowser and intercept Login URL', async () => {
      const request = {
        isTopFrame: true,
        loading: false,
        navigationType: 'click',
        title: 'Cozy Cloud',
        url: 'http://some-oidc-server.fr/oidc?offer=ecolyo&oidc=true'
      }

      const promise = processOIDC(request)

      act(() => {
        Linking.emit('url', {
          url: 'cozy://oidc_result?code=SOME_OIDC_CODE&fqdn=claude.somepartner.fr'
        })
      })

      const result = await promise

      expect(showInAppBrowser).toHaveBeenCalledWith({
        url: 'http://some-oidc-server.fr/oidc?offer=ecolyo&oidc=true&redirect_after_oidc=cozy%3A%2F%2Fflagship%2Foidc_result'
      })
      expect(result).toStrictEqual({
        code: 'SOME_OIDC_CODE',
        fqdn: 'claude.somepartner.fr',
        defaultRedirection: null
      })
    })

    it(`Should reject with 'INVALID_CALLBACK' when intercepted URL is not expected`, async () => {
      const request = {
        isTopFrame: true,
        loading: false,
        navigationType: 'click',
        title: 'Cozy Cloud',
        url: 'http://some-oidc-server.fr/oidc?offer=ecolyo&oidc=true'
      }

      const promise = processOIDC(request)

      act(() => {
        Linking.emit('url', {
          url: 'cozy://some_bad_url'
        })
      })

      await expect(promise).rejects.toEqual('INVALID_CALLBACK')
    })

    it(`Should reject with 'USER_CANCELED' when user closes the InAppBrowser`, async () => {
      const request = {
        isTopFrame: true,
        loading: false,
        navigationType: 'click',
        title: 'Cozy Cloud',
        url: 'http://some-oidc-server.fr/oidc?offer=ecolyo&oidc=true'
      }

      showInAppBrowser.mockResolvedValueOnce({ type: 'cancel' })

      const promise = processOIDC(request)

      await expect(promise).rejects.toEqual('USER_CANCELED')
    })
  })
})
