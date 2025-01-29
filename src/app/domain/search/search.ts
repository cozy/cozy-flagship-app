import CozyClient from 'cozy-client'
import type { SearchOptions } from 'cozy-dataproxy-lib/dist/search/types'
import Minilog from 'cozy-minilog'

import { CozyClientPerformanceApi } from '/app/domain/performances/measure'
import { SearchEngine } from '/app/domain/search/dataproxy-wrapper'

const log = Minilog('📱🗂️ Search')

let searchEngine: SearchEngine | undefined = undefined

export const initSearchEngine = (client: CozyClient): void => {
  log.debug('Init SearchEngine')
  searchEngine = new SearchEngine(client, null, CozyClientPerformanceApi)
}

export const search = (query: string, options: SearchOptions): unknown => {
  log.debug('Search for', query)
  if (!searchEngine) return undefined

  return searchEngine.search(query, options)
}
