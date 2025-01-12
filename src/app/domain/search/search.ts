import CozyClient from 'cozy-client'
// We cannot use `cozy-dataproxy-lib/api` here due to our bundler configuration.
// In the future we should find a way to homogenize bundlers configuration.
import { SearchEngine } from 'cozy-dataproxy-lib/dist/api'
import type { SearchOptions } from 'cozy-dataproxy-lib/dist/search/types'
import Minilog from 'cozy-minilog'

const log = Minilog('📱🗂️ Search')

let searchEngine: SearchEngine | undefined = undefined

export const initSearchEngine = (client: CozyClient): void => {
  log.debug('Init SearchEngine')
  searchEngine = new SearchEngine(client)
}

export const search = (query: string, options: SearchOptions): unknown => {
  log.debug('Search for', query)
  if (!searchEngine) return undefined

  return searchEngine.search(query, options)
}
