import CozyClient from 'cozy-client'
import type {
  SearchOptions,
  StorageInterface
} from 'cozy-dataproxy-lib/dist/search/types'
import Minilog from 'cozy-minilog'

import { CozyClientPerformanceApi } from '/app/domain/performances/measure'
import { SearchEngine } from '/app/domain/search/dataproxy-wrapper'
import { getData, storeData } from '/libs/localStore/storage'

const log = Minilog('📱🗂️ Search')

let searchEngine: SearchEngine | undefined = undefined
let searchInitPromise: Promise<SearchEngine> | null = null

const storage: StorageInterface = {
  storeData: storeData,
  getData: getData
}

export const makeSearchEngine = (client: CozyClient): SearchEngine => {
  if (searchEngine) {
    // Already exist, do nothing
    return searchEngine
  }
  searchEngine = new SearchEngine(
    client,
    storage,
    CozyClientPerformanceApi,
    { shouldInit: false } // Do the init manually to ensure all the indexes are ready
  )
  return searchEngine
}

export const initSearchEngine = (client: CozyClient): Promise<SearchEngine> => {
  log.debug('Init SearchEngine')

  if (!searchInitPromise) {
    // Use promise to handle parallel init
    searchInitPromise = (async (): Promise<SearchEngine> => {
      if (!searchEngine) {
        searchEngine = new SearchEngine(
          client,
          storage,
          CozyClientPerformanceApi,
          { shouldInit: false } // Do the init manually to ensure all the indexes are ready
        )
      }
      await searchEngine.init() // Once the init is done, we can safely search
      searchInitPromise = null
      return searchEngine
    })()
  }
  return searchInitPromise
}

export const search = async (
  client: CozyClient,
  query: string,
  options: SearchOptions
): Promise<unknown> => {
  log.debug('Search for', query)

  if (!searchEngine || Object.keys(searchEngine.searchIndexes).length < 1) {
    // The search indexes are not ready yet: let's init
    searchEngine = await initSearchEngine(client)
  }
  return searchEngine.search(query, options)
}
