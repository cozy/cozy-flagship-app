import get from 'lodash/get'
import uniqBy from 'lodash/uniqBy'
import {Q} from 'cozy-client'
import Minilog from '@cozy/minilog'
const log = Minilog('hydrateAndFilter')

/**
 * Since we can use methods or basic functions for
 * `shouldSave` and `shouldUpdate` we pass the
 * appropriate `this` and `arguments`.
 *
 * If `funcOrMethod` is a method, it will be called
 * with args[0] as `this` and the rest as `arguments`
 * Otherwise, `this` will be null and `args` will be passed
 * as `arguments`.
 */
const suitableCall = (funcOrMethod, ...args) => {
  const arity = funcOrMethod.length
  if (arity < args.length) {
    // must be a method
    return funcOrMethod.apply(args[0], args.slice(1))
  } else {
    // must be a function
    return funcOrMethod.apply(null, args)
  }
}

/**
 * Filters the passed array from data already present in the cozy so that there is
 * not duplicated data in the Cozy.
 *
 * You need at least the `GET` permission for the given doctype in your manifest, to be able to
 * use this function.
 *
 * @param {Array} documents: an array of objects corresponding to the data you want to save in the cozy
 * @param {String} doctype: the doctype where you want to save data (ex: 'io.cozy.bills')
 * @param {Array} options.keys: List of keys used to check that two items are the same. By default it is set to `['id']'.
 * @param {Object} options.selector: Mango request to get records. Default is built from the keys `{selector: {_id: {"$gt": null}}}` to get all the records.
 *
 * ```javascript
 * const documents = [
 *   {
 *     name: 'toto',
 *     height: 1.8
 *   },
 *   {
 *     name: 'titi',
 *     height: 1.7
 *   }
 * ]
 *
 * return hydrateAndFilter(documents, 'io.cozy.height', {
 *   keys: ['name']
 * }).then(filteredDocuments => addData(filteredDocuments, 'io.cozy.height'))
 *
 * ```
 */
const hydrateAndFilter = async (documents = [], doctype, options = {}) => {
  const client = options.client
  log.debug(`${documents.length} items before hydrateAndFilter`)
  if (!doctype) {
    throw new Error('Doctype is mandatory to filter the connector data.')
  }

  const keys = options.keys ? options.keys : ['_id']
  const store = {}

  const createHash = (item) => {
    return keys
      .map((key) => {
        let result = get(item, key)
        if (key === 'date') {
          result = new Date(result)
        }
        return result
      })
      .join('####')
  }

  const getItems = async () => {
    let queryObject = Q(doctype)
    if (options.selector) {
      queryObject = queryObject.where(options.selector)
    }

    const result = await client.queryAll(queryObject)
    return result
  }

  const populateStore = (currentStore) => (dbitems) => {
    dbitems.forEach((dbitem) => {
      currentStore[createHash(dbitem)] = dbitem
    })
  }

  // We add _id to `documents` that we find in the database.
  // This is useful when linking with bank operations (a bill
  // can already be in the database but not already matched
  // to an operation) since the linking operation need the _id
  // of the document
  const hydrateExistingEntries = (currentStore) => () => {
    documents.forEach((document) => {
      const key = createHash(document)
      if (currentStore[key]) {
        document._id = currentStore[key]._id
        document._rev = currentStore[key]._rev
        if (!document.cozyMetadata && currentStore[key].cozyMetadata) {
          document.cozyMetadata = currentStore[key].cozyMetadata
        }
      }
    })
    return documents
  }

  const defaultShouldSave = () => true
  const defaultShouldUpdate = (existing) => false

  const filterEntries = (currentStore) => async () => {
    // Filter out items according to shouldSave / shouldUpdate.
    // Both can be passed as option or can be part of the entry.
    return uniqBy(
      documents.filter((entry) => {
        const shouldSave =
          entry.shouldSave || options.shouldSave || defaultShouldSave
        const shouldUpdate =
          entry.shouldUpdate || options.shouldUpdate || defaultShouldUpdate
        const existing = currentStore[createHash(entry)]
        if (existing) {
          return suitableCall(shouldUpdate, entry, existing)
        } else {
          return suitableCall(shouldSave, entry)
        }
      }),
      (entry) => (entry && entry._id) || entry,
    )
  }

  const formatOutput = (entries) => {
    log.debug(`${entries.length} items after hydrateAndFilter`)
    return entries
  }

  return getItems()
    .then(populateStore(store))
    .then(hydrateExistingEntries(store))
    .then(filterEntries(store))
    .then((entries) => entries.filter(Boolean)) // Filter out wrong entries
    .then(formatOutput)
}

module.exports = hydrateAndFilter
