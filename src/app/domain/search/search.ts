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

const storage: StorageInterface = {
  storeData: storeData,
  getData: getData
}

export const initSearchEngine = (client: CozyClient): void => {
  log.debug('Init SearchEngine')
  searchEngine = new SearchEngine(client, storage, CozyClientPerformanceApi)
}

export const search = (query: string, options: SearchOptions): unknown => {
  log.debug('Search for', query)
  if (!searchEngine) return undefined

  return searchEngine.search(query, options)
}
