import hydrateAndFilter from './hydrateAndFilter'
import addData from './addData'
import Minilog from '@cozy/minilog'
import _ from 'lodash'
const log = Minilog('saveBills')
const DOCTYPE = 'io.cozy.bills'

const requiredAttributes = {
  // date: 'isDate',
  amount: 'isNumber',
  vendor: 'isString',
}

/**
 * Combines the features of `saveFiles`, `hydrateAndFilter`, `addData` for a
 * common case: bills.
 * Will create `io.cozy.bills` objects. The default deduplication keys are `['date', 'amount', 'vendor']`.
 * You need the full permission on `io.cozy.bills`, full permission on `io.cozy.files`
 * in your manifest, to be able to use this function.
 *
 * @param {Array} documents: an array of objects corresponding to the data you want to save in the cozy
 */
const saveBills = async (inputEntries, inputOptions = {}) => {
  // Cloning input arguments since both entries and options are expected
  // to be modified by functions called inside saveBills.
  const entries = _.cloneDeepWith(inputEntries, (value) => {
    // do not try to clone streams https://github.com/konnectors/libs/issues/682
    if (value && value.readable) {
      return value
    }
    return undefined
  })
  const options = _.cloneDeep(inputOptions)

  if (!_.isArray(entries) || entries.length === 0) {
    log.warn('saveBills: no bills to save')
    return
  }

  // Deduplicate on this keys
  options.keys = options.keys || Object.keys(requiredAttributes)

  const defaultShouldUpdate = (entry, dbEntry) =>
    entry.invoice !== dbEntry.invoice ||
    !dbEntry.cozyMetadata ||
    !dbEntry.matchingCriterias

  if (!options.shouldUpdate) {
    options.shouldUpdate = defaultShouldUpdate
  } else {
    const fn = options.shouldUpdate
    options.shouldUpdate = (entry, dbEntry) => {
      return defaultShouldUpdate(entry, dbEntry) || fn(entry, dbEntry)
    }
  }
  let tempEntries
  tempEntries = manageContractsData(entries, options)

  // TODO find proper pdf lib to handle this feature
  // if (options.processPdf) {
  //   let moreEntries = []
  //   for (let entry of tempEntries) {
  //     if (entry.fileDocument) {
  //       let pdfContent
  //       try {
  //         pdfContent = await utils.getPdfText(entry.fileDocument._id)

  //         // allow to create more entries related to the same file
  //         const result = await options.processPdf(
  //           entry,
  //           pdfContent.text,
  //           pdfContent,
  //         )
  //         if (result && result.length) moreEntries = [...moreEntries, ...result]
  //       } catch (err) {
  //         log(
  //           'warn',
  //           `processPdf: Failed to read pdf content in ${_.get(
  //             entry,
  //             'fileDocument.attributes.name',
  //           )}`,
  //         )
  //         log('warn', err.message)
  //         entry.__ignore = true
  //       }
  //     }
  //   }
  //   if (moreEntries.length) tempEntries = [...tempEntries, ...moreEntries]
  // }

  tempEntries = tempEntries
    .filter((entry) => !entry.__ignore)
    // we do not save bills without associated file anymore
    .filter((entry) => entry.fileDocument)
    .map((entry) => {
      entry.currency = convertCurrency(entry.currency)
      entry.invoice = `io.cozy.files:${entry.fileDocument._id}`
      delete entry.fileDocument
      delete entry.fileAttributes
      return entry
    })

  checkRequiredAttributes(tempEntries)

  tempEntries = await hydrateAndFilter(tempEntries, DOCTYPE, options)
  tempEntries = await addData(tempEntries, DOCTYPE, options)
  return tempEntries
}

function convertCurrency(currency) {
  if (currency) {
    if (currency.includes('€')) {
      return 'EUR'
    } else if (currency.includes('$')) {
      return 'USD'
    } else if (currency.includes('£')) {
      return 'GBP'
    } else {
      return currency
    }
  } else {
    return 'EUR'
  }
}

function checkRequiredAttributes(entries) {
  for (let entry of entries) {
    for (let attr in requiredAttributes) {
      if (entry[attr] == null) {
        throw new Error(
          `saveBills: an entry is missing the required ${attr} attribute`,
        )
      }
      const checkFunction = requiredAttributes[attr]
      const isExpectedType = _(entry[attr])[checkFunction]()
      if (isExpectedType === false) {
        throw new Error(
          `saveBills: an entry has a ${attr} which does not respect ${checkFunction}`,
        )
      }
    }
  }
}

function manageContractsData(tempEntries, options) {
  if (options.contractLabel && options.contractId === undefined) {
    log('warn', 'contractLabel used without contractId, ignoring it.')
    return tempEntries
  }

  let newEntries = tempEntries
  // if contractId passed by option
  if (options.contractId) {
    // Define contractlabel from contractId if not set in options
    if (!options.contractLabel) {
      options.contractLabel = options.contractId
    }
    // Set saving path from contractLabel
    options.subPath = options.contractLabel
    // Add contractId to deduplication keys
    addContractIdToDeduplication(options)
    // Add contract data to bills
    newEntries = newEntries.map((entry) =>
      addContractsDataToBill(entry, options),
    )

    // if contractId passed by bill attribute
  } else if (billsHaveContractId(newEntries)) {
    // Add contractId to deduplication keys
    addContractIdToDeduplication(options)

    newEntries = newEntries.map((entry) => mergeContractsDataInBill(entry))
    // manageContractsDataPassedByAttribute(newEntries, options
  }
  return newEntries
}

function addContractsDataToBill(entry, options) {
  entry.contractLabel = options.contractLabel
  entry.contractId = options.contractId
  return entry
}

function mergeContractsDataInBill(entry) {
  // Only treat bill with data
  if (entry.contractId) {
    // Surcharge label in needed
    if (!entry.contractLabel) {
      entry.contractLabel = entry.contractId
    }
    // Edit subpath of each bill according to contractLabel
    entry.subPath = entry.contractLabel
  }
  return entry
}

/* This function return true if at least one bill of entries has a contractId
 */
function billsHaveContractId(entries) {
  for (const entry of entries) {
    if (entry.contractId) {
      return true
    }
  }
  return false
}

/* Add contractId to deduplication keys
 */
function addContractIdToDeduplication(options) {
  if (options.keys) {
    options.keys.push('contractId')
  }
}

module.exports = saveBills
module.exports.manageContractsData = manageContractsData
