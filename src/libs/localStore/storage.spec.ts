import {
  getData as initialGetData,
  storeData as initialStoreData
} from '/libs/localStore/storage'

const getData = initialGetData as (name: string) => Promise<unknown>
const storeData = initialStoreData as (
  name: string,
  value: unknown
) => Promise<unknown>

it('should store and retrieve a string value', async () => {
  const key = 'string'
  const value = 'test'
  await storeData(key, value)
  const result = await getData(key)
  expect(result).toStrictEqual(value)
})

it('should store and retrieve an object value', async () => {
  const key = 'object'
  const value = { test: 'test' }
  await storeData(key, value)
  const result = await getData(key)
  expect(result).toStrictEqual(value)
})

it('should store and retrieve an array value', async () => {
  const key = 'array'
  const value = ['test', 'test']
  await storeData(key, value)
  const result = await getData(key)
  expect(result).toStrictEqual(value)
})

it('should store and retrieve a number value', async () => {
  const key = 'number'
  const value = 123
  await storeData(key, value)
  const result = await getData(key)
  expect(result).toStrictEqual(value)
})

it('should store and retrieve a boolean value', async () => {
  const key = 'boolean'
  const value = false
  await storeData(key, value)
  const result = await getData(key)
  expect(result).toStrictEqual(value)
})

it('should store and retrieve a null value', async () => {
  const key = 'null'
  const value = null
  await storeData(key, value)
  const result = await getData(key)
  expect(result).toStrictEqual(value)
})

it('should not store and retrieve an undefined value', async () => {
  const key = 'undefined'
  const value = undefined
  await storeData(key, value)
  const result = await getData(key)
  expect(result).not.toStrictEqual(value)
  expect(result).toStrictEqual(null)
})
