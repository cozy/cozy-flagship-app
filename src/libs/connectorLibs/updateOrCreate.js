import Minilog from '@cozy/minilog'
import get from 'lodash/get'
import { Q } from 'cozy-client'
const log = Minilog('updateOrCreate')

/**
 * Creates or updates the given entries according to if they already
 * exist in the cozy or not
 *
 * You need the full permission for the given doctype in your manifest, to be able to
 * use this function.
 *
 * @param {Array} entries: Documents to save
 * @param {String} doctype: Doctype of the documents
 * @param {Array<String>} matchingAttributes: attributes in each entry used to check if an entry already exists in the Cozy
 * @param {CozyClient} options.client : CozyClient instance
 */
const updateOrCreate = async (
  entries = [],
  doctype,
  matchingAttributes = [],
  options = {}
) => {
  const client = options.client
  const existings = await client.queryAll(Q(doctype))
  for (const entry of entries) {
    const toUpdate = existings.find(doc =>
      matchingAttributes.reduce(
        (isMatching, matchingAttribute) =>
          isMatching &&
          get(doc, matchingAttribute) === get(entry, matchingAttribute),
        true
      )
    )
    if (toUpdate) {
      log.debug('updating', toUpdate)
      const { data: result } = await client.save({
        ...entry,
        _id: toUpdate._id,
        _rev: toUpdate._rev,
        _type: doctype
      })
      return result
    } else {
      log.debug('creating', entry)
      const { data: result } = await client.save({ ...entry, _type: doctype })
      return result
    }
  }
}
module.exports = updateOrCreate
