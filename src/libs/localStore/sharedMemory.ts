import { PostMeMessageOptions } from 'cozy-intent'

/*
  This shared memory is meant to store generic data accessible by
  Cozy webviews. It is a very simple implementation for the moment.
*/
export type SharedMemorySlug = 'mespapiers'
export type SharedMemoryKey = 'scanDocument'
export type SharedMemoryData = string | undefined

const VALID_SLUGS = ['mespapiers']
const VALID_KEYS = ['scanDocument']

const isValidSlug = (slug: string): slug is SharedMemorySlug => {
  return VALID_SLUGS.includes(slug)
}

const isValidKey = (key: string): key is SharedMemoryKey => {
  return VALID_KEYS.includes(key)
}

const sharedMemory = {
  mespapiers: {
    scanDocument: undefined as SharedMemoryData
  }
}

export const getSharedMemory = (
  slug: SharedMemorySlug,
  key: SharedMemoryKey
): SharedMemoryData => {
  return sharedMemory[slug][key]
}

export const storeSharedMemory = (
  slug: SharedMemorySlug,
  key: SharedMemoryKey,
  value: SharedMemoryData
): void => {
  sharedMemory[slug][key] = value
}

export const removeSharedMemory = (
  slug: SharedMemorySlug,
  key: SharedMemoryKey
): void => {
  sharedMemory[slug][key] = undefined
}

export const getSharedMemoryIntent = async (
  options: PostMeMessageOptions,
  key: string
): Promise<SharedMemoryData> => {
  const { slug } = options

  if (isValidSlug(slug) && isValidKey(key)) {
    return Promise.resolve(getSharedMemory(slug, key))
  }
}

export const storeSharedMemoryIntent = async (
  options: PostMeMessageOptions,
  key: string,
  value: SharedMemoryData
): Promise<void> => {
  const { slug } = options

  if (isValidSlug(slug) && isValidKey(key)) {
    return Promise.resolve(storeSharedMemory(slug, key, value))
  }
}

export const removeSharedMemoryIntent = async (
  options: PostMeMessageOptions,
  key: string
): Promise<void> => {
  const { slug } = options

  if (isValidSlug(slug) && isValidKey(key)) {
    return Promise.resolve(removeSharedMemory(slug, key))
  }
}
