import CookieManager, { Cookie } from '@react-native-cookies/cookies'
import { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes'

import {
  _stateManager,
  cleanAllConnectorCookies,
  cleanConnectorCookies,
  handleWorkerStartRequest
} from '/libs/connectors/manageCookies'

const mockCookieState = {
  ['https://microsoft.com']: {
    cookie1: {
      name: 'cookie1',
      value: 'value1',
      expires: 'Thu, 01 Jan 2000 00:00:00 GMT'
    },
    cookie2: {
      name: 'cookie2',
      value: 'value2',
      expires: 'Thu, 01 Jan 2000 00:00:00 GMT'
    }
  },
  ['https://google.com']: {
    cookie3: {
      name: 'cookie3',
      value: 'value3',
      expires: 'Thu, 01 Jan 2000 00:00:00 GMT'
    },
    cookie4: {
      name: 'cookie4',
      value: 'value4',
      expires: 'Thu, 01 Jan 2000 00:00:00 GMT'
    }
  }
} as Record<string, Record<string, Cookie>>

jest.mock('@react-native-cookies/cookies', () => ({
  get: jest.fn().mockImplementation((url: string) => mockCookieState[url]),
  set: jest.fn().mockImplementation((url: string, cookie: Cookie) => {
    const existing = mockCookieState[url]
    if (existing) existing[cookie.name] = cookie
    else mockCookieState[url] = { [cookie.name]: cookie }
  })
}))

afterEach(() => {
  _stateManager.cleanStore()
})

it('should push to store', () => {
  const url = 'https://google.com'
  const expected = [url]

  handleWorkerStartRequest({ url } as ShouldStartLoadRequest)

  expect(_stateManager.getFromStore()).toEqual(expected)
})

it('should clean cookies from specified url', async () => {
  _stateManager.pushToStore('https://google.com')
  _stateManager.pushToStore('https://microsoft.com')

  await cleanConnectorCookies('https://microsoft.com')

  expect(_stateManager.getFromStore()).toStrictEqual(['https://google.com'])
  expect(CookieManager.get('https://microsoft.com')).toStrictEqual({
    cookie1: {
      expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
      name: 'cookie1',
      value: 'value1'
    },
    cookie2: {
      expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
      name: 'cookie2',
      value: 'value2'
    }
  })
})

it('should clean cookies from all urls', async () => {
  _stateManager.pushToStore('https://google.com')
  _stateManager.pushToStore('https://microsoft.com')

  await cleanAllConnectorCookies()

  expect(_stateManager.getFromStore()).toStrictEqual([])
  expect(CookieManager.get('https://microsoft.com')).toStrictEqual({
    cookie1: {
      expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
      name: 'cookie1',
      value: 'value1'
    },
    cookie2: {
      expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
      name: 'cookie2',
      value: 'value2'
    }
  })
  expect(CookieManager.get('https://google.com')).toStrictEqual({
    cookie3: {
      expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
      name: 'cookie3',
      value: 'value3'
    },
    cookie4: {
      expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
      name: 'cookie4',
      value: 'value4'
    }
  })
})
