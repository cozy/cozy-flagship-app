import Minilog from '@cozy/minilog'
const log = Minilog('addData')

/**
 * Saves the data into the cozy blindly without check.
 *
 * You need at least the `POST` permission for the given doctype in your manifest, to be able to
 * use this function.
 *
 * @param {Array} entries: an array of objects corresponding to the data you want to save in the cozy
 * @param {String} doctype: the doctype where you want to save data (ex: 'io.cozy.bills')
 * @param {CozyClient} options.client
 */
const addData = async (entries, doctype, options = {}) => {
  const client = options.client
  const result = []
  for (const entry of entries) {
    log.debug('Adding entry', entry)
    const doc = await client.save({ ...entry, _type: doctype })
    const dbEntry = doc.data
    entry._id = dbEntry._id
    result.push(dbEntry)
  }
  return result
}

module.exports = addData
