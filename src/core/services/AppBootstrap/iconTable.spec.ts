import AsyncStorage from '@react-native-async-storage/async-storage'

import CozyClient from 'cozy-client'

import strings from '/constants/strings.json'
import { expectedTable } from '/tests/fixtures/expected-table'
import { getApps } from '/tests/fixtures/get-apps'
import {
  IconsCache,
  TESTING_ONLY_clearIconTable,
  iconTable,
  manageIconCache
} from '/libs/functions/iconTable'

const client = {
  getStackClient: (): { fetchJSON: jest.Mock } => ({
    fetchJSON: jest.fn().mockImplementation(() => '<svg></svg>')
  }),
  fetchQueryAndGetFromState: jest.fn().mockImplementation(() => getApps)
} as unknown as CozyClient

afterEach(async () => {
  jest.clearAllMocks()
  TESTING_ONLY_clearIconTable()
  await AsyncStorage.removeItem(strings.APPS_ICONS)
})

it('works with an empty cache', async () => {
  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)

  const item = await AsyncStorage.getItem(strings.APPS_ICONS)

  if (!item) throw new Error('No item found in AsyncStorage.')

  const cache = JSON.parse(item) as IconsCache

  expect(cache).toStrictEqual(expectedTable)
})

it('works with an incomplete cache', async () => {
  await AsyncStorage.setItem(
    strings.APPS_ICONS,
    JSON.stringify({ store: { version: '1.9.11', xml: '<svg></svg>' } })
  )

  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)

  const item = await AsyncStorage.getItem(strings.APPS_ICONS)

  if (!item) throw new Error('No item found in AsyncStorage.')

  const cache = JSON.parse(item) as IconsCache

  expect(cache).toStrictEqual(expectedTable)
})

it('works with a broken cache', async () => {
  await AsyncStorage.setItem(
    strings.APPS_ICONS,
    JSON.stringify({ drive: 'bar' })
  )

  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)

  const item = await AsyncStorage.getItem(strings.APPS_ICONS)

  if (!item) throw new Error('No item found in AsyncStorage.')

  const cache = JSON.parse(item) as IconsCache

  expect(cache).toStrictEqual(expectedTable)
})

it('works with a complete cache', async () => {
  await AsyncStorage.setItem(strings.APPS_ICONS, JSON.stringify(expectedTable))

  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)

  const item = await AsyncStorage.getItem(strings.APPS_ICONS)

  if (!item) throw new Error('No item found in AsyncStorage.')

  const cache = JSON.parse(item) as IconsCache

  expect(cache).toStrictEqual(expectedTable)
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

  const item = await AsyncStorage.getItem(strings.APPS_ICONS)

  if (!item) throw new Error('No item found in AsyncStorage.')

  const cache = JSON.parse(item) as IconsCache

  expect(cache).toStrictEqual(expectedTable)
})

it('works with unusual semver', async () => {
  await AsyncStorage.setItem(
    strings.APPS_ICONS,
    JSON.stringify({ store: { version: '1.0.0', xml: '<svg></svg>' } })
  )

  const client = {
    getStackClient: (): { fetchJSON: jest.Mock } => ({
      fetchJSON: jest.fn().mockImplementation(() => '<svg></svg>')
    }),
    fetchQueryAndGetFromState: jest.fn().mockImplementation(() => ({
      data: [{ attributes: { slug: 'store', version: '1.0.0-beta.1' } }]
    }))
  } as unknown as CozyClient

  await manageIconCache(client)

  expect(iconTable).toStrictEqual({
    store: { version: '1.0.0-beta.1', xml: '<svg></svg>' }
  })

  const item = await AsyncStorage.getItem(strings.APPS_ICONS)

  if (!item) throw new Error('No item found in AsyncStorage.')

  const cache = JSON.parse(item) as IconsCache

  expect(cache).toStrictEqual({
    store: { version: '1.0.0-beta.1', xml: '<svg></svg>' }
  })
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

  const item = await AsyncStorage.getItem(strings.APPS_ICONS)

  if (!item) throw new Error('No item found in AsyncStorage.')

  const cache = JSON.parse(item) as IconsCache

  expect(cache).toStrictEqual(expectedTable)
})

it('works offline or with network issues without cache', async () => {
  const client = {
    fetchQueryAndGetFromState: jest.fn().mockImplementation(() => {
      // Empty response
    })
  } as unknown as CozyClient

  await manageIconCache(client)

  expect(iconTable).toStrictEqual({})

  expect(await AsyncStorage.getItem(strings.APPS_ICONS)).toStrictEqual(null)
})

it('works offline or with network issues with cache', async () => {
  const client = {
    fetchQueryAndGetFromState: jest.fn().mockImplementation(() => {
      // Empty response
    })
  } as unknown as CozyClient

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
