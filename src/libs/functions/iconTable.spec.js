import AsyncStorage from '@react-native-async-storage/async-storage'
import { createMockClient } from 'cozy-client'

import {
  iconTable,
  manageIconCache,
  TESTING_ONLY_clearIconTable
} from './iconTable'
import getApps from '../../../__tests__/fixtures/get.apps'
import expectedTable from '../../../__tests__/fixtures/expected.table'
import strings from '../../strings.json'

const client = createMockClient({})

client
  .getStackClient()
  .fetchJSON.mockImplementation((_get, url) =>
    url.includes('apps') ? getApps : url.includes('icon') ? '<svg></svg>' : null
  )

afterEach(async () => {
  jest.clearAllMocks()
  TESTING_ONLY_clearIconTable()
  await AsyncStorage.removeItem(strings.APPS_ICONS)
})

it('works with an empty cache', async () => {
  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)
  expect(
    JSON.parse(await AsyncStorage.getItem(strings.APPS_ICONS))
  ).toStrictEqual(expectedTable)
})

it('works with an incomplete cache', async () => {
  await AsyncStorage.setItem(
    strings.APPS_ICONS,
    JSON.stringify({ store: { version: '1.9.11', xml: '<svg></svg>' } })
  )

  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)
  expect(
    JSON.parse(await AsyncStorage.getItem(strings.APPS_ICONS))
  ).toStrictEqual(expectedTable)
})

it('works with a broken cache', async () => {
  await AsyncStorage.setItem(
    strings.APPS_ICONS,
    JSON.stringify({ drive: 'bar' })
  )

  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)
  expect(
    JSON.parse(await AsyncStorage.getItem(strings.APPS_ICONS))
  ).toStrictEqual(expectedTable)
})

it('works with a complete cache', async () => {
  await AsyncStorage.setItem(strings.APPS_ICONS, JSON.stringify(expectedTable))

  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)
  expect(
    JSON.parse(await AsyncStorage.getItem(strings.APPS_ICONS))
  ).toStrictEqual(expectedTable)
})

it('works with an obsolete cache', async () => {
  await AsyncStorage.setItem(
    strings.APPS_ICONS,
    JSON.stringify({
      banks: { version: '0.0.0', xml: '<svg></svg>' },
      coachco2: { version: '0.0.0', xml: '<svg></svg>' },
      contacts: { version: '0.0.0', xml: '<svg></svg>' },
      drive: { version: '0.0.0', xml: '<svg></svg>' },
      home: { version: '0.0.0', xml: '<svg></svg>' },
      mespapiers: { version: '0.0.0', xml: '<svg></svg>' },
      notes: { version: '0.0.0', xml: '<svg></svg>' },
      passwords: { version: '0.0.0', xml: '<svg></svg>' },
      photos: { version: '0.0.0', xml: '<svg></svg>' },
      settings: { version: '0.0.0', xml: '<svg></svg>' },
      store: { version: '0.0.0', xml: '<svg></svg>' }
    })
  )

  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)
  expect(
    JSON.parse(await AsyncStorage.getItem(strings.APPS_ICONS))
  ).toStrictEqual(expectedTable)
})

it('works with unusual semver', async () => {
  await AsyncStorage.setItem(
    strings.APPS_ICONS,
    JSON.stringify({ store: { version: '1.0.0', xml: '<svg></svg>' } })
  )
  client
    .getStackClient()
    .fetchJSON.mockImplementationOnce((_get, url) =>
      url.includes('apps')
        ? { data: [{ attributes: { slug: 'store', version: '1.0.0-beta.1' } }] }
        : url.includes('icon')
        ? '<svg></svg>'
        : null
    )

  await manageIconCache(client)

  expect(iconTable).toStrictEqual({
    store: { version: '1.0.0-beta.1', xml: '<svg></svg>' }
  })
  expect(
    JSON.parse(await AsyncStorage.getItem(strings.APPS_ICONS))
  ).toStrictEqual({ store: { version: '1.0.0-beta.1', xml: '<svg></svg>' } })
})

it('works with an incomplete and obsolete cache', async () => {
  await AsyncStorage.setItem(
    strings.APPS_ICONS,
    JSON.stringify({
      banks: { version: '0.0.0', xml: '<svg></svg>' },
      coachco2: { version: '0.0.0', xml: '<svg></svg>' },
      contacts: { version: '0.0.0', xml: '<svg></svg>' },
      drive: { version: '0.0.0', xml: '<svg></svg>' },
      home: { version: '0.0.0', xml: '<svg></svg>' }
    })
  )

  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)
  expect(
    JSON.parse(await AsyncStorage.getItem(strings.APPS_ICONS))
  ).toStrictEqual(expectedTable)
})

it('works offline or with network issues without cache', async () => {
  client.getStackClient().fetchJSON.mockImplementation(() => {})

  await manageIconCache(client)

  expect(iconTable).toStrictEqual({})
  expect(await AsyncStorage.getItem(strings.APPS_ICONS)).toStrictEqual(null)
})

it('works offline or with network issues with cache', async () => {
  client.getStackClient().fetchJSON.mockImplementation(() => {})
  await AsyncStorage.setItem(
    strings.APPS_ICONS,
    JSON.stringify({ store: { version: '1.9.11', xml: '<svg></svg>' } })
  )

  await manageIconCache(client)

  expect(iconTable).toStrictEqual({
    store: { version: '1.9.11', xml: '<svg></svg>' }
  })
  expect(await AsyncStorage.getItem(strings.APPS_ICONS)).toStrictEqual(
    '{"store":{"version":"1.9.11","xml":"<svg></svg>"}}'
  )
})
