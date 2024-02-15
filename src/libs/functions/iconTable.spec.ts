import CozyClient from 'cozy-client'

import { expectedTable } from '/tests/fixtures/expected-table'
import { getApps } from '/tests/fixtures/get-apps'
import {
  TESTING_ONLY_clearIconTable,
  iconTable,
  manageIconCache
} from '/libs/functions/iconTable'
import {
  getData,
  StorageKeys,
  storeData,
  removeData
} from '/libs/localStore/storage'
import type { IconsCache } from '/libs/localStore/storage'

const client = {
  getStackClient: (): { fetchJSON: jest.Mock } => ({
    fetchJSON: jest.fn().mockImplementation(() => '<svg></svg>')
  }),
  fetchQueryAndGetFromState: jest.fn().mockImplementation(() => getApps)
} as unknown as CozyClient

afterEach(async () => {
  jest.clearAllMocks()
  TESTING_ONLY_clearIconTable()
  await removeData(StorageKeys.IconsTable)
})

it('works with an empty cache', async () => {
  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)

  const item = await getData<IconsCache>(StorageKeys.IconsTable)

  if (!item) throw new Error('No item found in storage.')

  expect(item).toStrictEqual(expectedTable)
})

it('works with an incomplete cache', async () => {
  await storeData(StorageKeys.IconsTable, {
    store: { version: '1.9.11', xml: '<svg></svg>' }
  })

  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)

  const item = await getData<IconsCache>(StorageKeys.IconsTable)
  if (!item) throw new Error('No item found in storage.')

  expect(item).toStrictEqual(expectedTable)
})

it('works with a broken cache', async () => {
  // @ts-expect-error We try explicitly with an invalid type here
  await storeData(StorageKeys.IconsTable, { drive: 'bar' })

  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)

  const item = await getData<IconsCache>(StorageKeys.IconsTable)

  if (!item) throw new Error('No item found in storage.')

  expect(item).toStrictEqual(expectedTable)
})

it('works with a complete cache', async () => {
  await storeData(StorageKeys.IconsTable, expectedTable)

  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)

  const item = await getData<IconsCache>(StorageKeys.IconsTable)

  if (!item) throw new Error('No item found in storage.')

  expect(item).toStrictEqual(expectedTable)
})

it('works with an obsolete cache', async () => {
  await storeData(StorageKeys.IconsTable, {
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

  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)

  const item = await getData<IconsCache>(StorageKeys.IconsTable)

  if (!item) throw new Error('No item found in storage.')

  expect(item).toStrictEqual(expectedTable)
})

it('works with unusual semver', async () => {
  await storeData(StorageKeys.IconsTable, {
    store: { version: '1.0.0', xml: '<svg></svg>' }
  })

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

  const item = await getData<IconsCache>(StorageKeys.IconsTable)

  if (!item) throw new Error('No item found in storage.')

  expect(item).toStrictEqual({
    store: { version: '1.0.0-beta.1', xml: '<svg></svg>' }
  })
})

it('works with an incomplete and obsolete cache', async () => {
  await storeData(StorageKeys.IconsTable, {
    banks: { version: '0.0.0', xml: '<svg></svg>' },
    coachco2: { version: '0.0.0', xml: '<svg></svg>' },
    contacts: { version: '0.0.0', xml: '<svg></svg>' },
    drive: { version: '0.0.0', xml: '<svg></svg>' },
    home: { version: '0.0.0', xml: '<svg></svg>' }
  })

  await manageIconCache(client)

  expect(iconTable).toStrictEqual(expectedTable)

  const item = await getData<IconsCache>(StorageKeys.IconsTable)

  if (!item) throw new Error('No item found in storage.')

  expect(item).toStrictEqual(expectedTable)
})

it('works offline or with network issues without cache', async () => {
  const client = {
    fetchQueryAndGetFromState: jest.fn().mockImplementation(() => {
      // Empty response
    })
  } as unknown as CozyClient

  await manageIconCache(client)

  expect(iconTable).toStrictEqual({})

  expect(await getData<IconsCache>(StorageKeys.IconsTable)).toStrictEqual(null)
})

it('works offline or with network issues with cache', async () => {
  const client = {
    fetchQueryAndGetFromState: jest.fn().mockImplementation(() => {
      // Empty response
    })
  } as unknown as CozyClient

  await storeData(StorageKeys.IconsTable, {
    store: { version: '1.9.11', xml: '<svg></svg>' }
  })

  await manageIconCache(client)

  expect(iconTable).toStrictEqual({
    store: { version: '1.9.11', xml: '<svg></svg>' }
  })

  expect(await getData<IconsCache>(StorageKeys.IconsTable)).toStrictEqual(
    JSON.parse('{"store":{"version":"1.9.11","xml":"<svg></svg>"}}')
  )
})
