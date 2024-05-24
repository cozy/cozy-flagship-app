/*
  This shared memory is meant to store generic data accessible by
  Cozy webviews. It is a very simple implementation for the moment.
*/
type SharedMemorySlug = 'mespapiers'
type SharedMemoryKey = 'scanDocument'
type SharedMemoryData = string | undefined

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

export const sharedMemoryLocalMethods = {
  getSharedMemory: (
    slug: SharedMemorySlug,
    key: SharedMemoryKey
  ): Promise<SharedMemoryData> => Promise.resolve(getSharedMemory(slug, key)),
  storeSharedMemory: (
    slug: SharedMemorySlug,
    key: SharedMemoryKey,
    value: SharedMemoryData
  ): Promise<void> => Promise.resolve(storeSharedMemory(slug, key, value)),
  removeSharedMemory: (
    slug: SharedMemorySlug,
    key: SharedMemoryKey
  ): Promise<void> => Promise.resolve(removeSharedMemory(slug, key))
}
