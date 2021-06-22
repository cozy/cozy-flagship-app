import Minilog from '@cozy/minilog'
import get from 'lodash/get'
import omit from 'lodash/omit'
import {Client} from 'cozy-client-js'
import {Q} from 'cozy-client'
import retry from 'bluebird-retry'

let cozy
let client

const log = Minilog('saveFiles')

const saveFiles = async (entries, folderPath, options = {}) => {
  if (!entries || entries.length === 0) {
    log.warn('No file to download')
  }
  if (!options.sourceAccount) {
    log.warn('There is no sourceAccount given to saveFiles')
  }
  if (!options.sourceAccountIdentifier) {
    log.warn('There is no sourceAccountIdentifier given to saveFiles')
  }
  if (!options.client) {
    throw new Error('No cozy-client instance given')
  }

  client = options.client
  cozy = initCozyClientJs(client)

  const saveOptions = {
    folderPath,
    fileIdAttributes: options.fileIdAttributes,
    manifest: options.manifest,
    postProcess: options.postProcess,
    contentType: options.contentType,
    shouldReplaceFile: options.shouldReplaceFile,
    validateFile: options.validateFile || defaultValidateFile,
    sourceAccountOptions: {
      sourceAccount: options.sourceAccount,
      sourceAccountIdentifier: options.sourceAccountIdentifier,
    },
  }

  if (options.validateFileContent) {
    if (options.validateFileContent === true) {
      saveOptions.validateFileContent = defaultValidateFileContent
    } else if (typeof options.validateFileContent === 'function') {
      saveOptions.validateFileContent = options.validateFileContent
    }
  }

  noMetadataDeduplicationWarning(saveOptions)

  const canBeSaved = (entry) => entry.filestream

  let savedFiles = 0
  const savedEntries = []
  for (let entry of entries) {
    ;['filename', 'shouldReplaceName'].forEach((key) =>
      addValOrFnResult(entry, key, options),
    )
    if (entry.filestream && !entry.filename) {
      log.warn(
        'Missing filename property for for filestream entry, entry is ignored',
      )
      return
    }
    if (canBeSaved(entry)) {
      const resultFolderPath = await getOrCreateDestinationPath(
        entry,
        saveOptions,
      )
      entry = await saveEntry(entry, {...saveOptions, resultFolderPath})
      if (entry && entry._cozy_file_to_create) {
        savedFiles++
        delete entry._cozy_file_to_create
      }
    }
    savedEntries.push(entry)
  }

  log.info(
    `Created ${savedFiles} files for ${
      savedEntries ? savedEntries.length : 'n'
    } entries`,
  )
  return savedEntries
}

const saveEntry = async function (entry, options) {
  let file = await getFileIfExists(entry, options)
  let shouldReplace = false
  if (file) {
    try {
      shouldReplace = await shouldReplaceFile(file, entry, options)
    } catch (err) {
      log.info(`Error in shouldReplaceFile : ${err.message}`)
      shouldReplace = true
    }
  }

  let method = 'create'

  if (shouldReplace && file) {
    method = 'updateById'
    log.debug(`Will replace ${getFilePath({options, file})}...`)
  }

  try {
    if (!file || method === 'updateById') {
      log.debug(omit(entry, 'filestream'))
      logFileStream(entry.filestream)
      log.debug(
        `File ${getFilePath({
          options,
          entry,
        })} does not exist yet or is not valid`,
      )
      entry._cozy_file_to_create = true
      file = await retry(createFile, {
        interval: 1000,
        throw_original: true,
        max_tries: options.retry,
        args: [entry, options, method, file ? file._id : undefined],
      }).catch((err) => {
        if (err.message === 'BAD_DOWNLOADED_FILE') {
          log.warn(
            `Could not download file after ${options.retry} tries removing the file`,
          )
        } else {
          log.warn('unknown file download error: ' + err.message)
          log.warn(err)
        }
      })
    }

    attachFileToEntry(entry, file)

    sanitizeEntry(entry)
    if (options.postProcess) {
      await options.postProcess(entry)
    }
  } catch (err) {
    if (getErrorStatus(err) === 413) {
      // the cozy quota is full
      throw new Error('DISK_QUOTA_EXCEEDED')
    }
    log.warn('SAVE_FILE_FAILED')
    log.warn(err.message)
    log.warn(
      `Error caught while trying to save the file ${
        entry.fileurl ? entry.fileurl : entry.filename
      }`,
    )
  }
  return entry
}

function noMetadataDeduplicationWarning(options) {
  const fileIdAttributes = options.fileIdAttributes
  if (!fileIdAttributes) {
    log.warn(
      'No deduplication key is defined, file deduplication will be based on file path',
    )
  }

  const slug = get(options, 'manifest.slug')
  if (!slug) {
    log.warn(
      'No slug is defined for the current connector, file deduplication will be based on file path',
    )
  }

  const sourceAccountIdentifier = get(
    options,
    'sourceAccountOptions.sourceAccountIdentifier',
  )
  if (!sourceAccountIdentifier) {
    log.warn(
      'No sourceAccountIdentifier is defined in options, file deduplication will be based on file path',
    )
  }
}

async function getFileIfExists(entry, options) {
  const fileIdAttributes = options.fileIdAttributes
  const slug = options.manifest.slug
  const sourceAccountIdentifier = get(
    options,
    'sourceAccountOptions.sourceAccountIdentifier',
  )

  const isReadyForFileMetadata =
    fileIdAttributes && slug && sourceAccountIdentifier
  if (isReadyForFileMetadata) {
    const file = await getFileFromMetaData(
      entry,
      fileIdAttributes,
      sourceAccountIdentifier,
      slug,
    )
    if (!file) {
      // no file with correct metadata, maybe the corresponding file already exist in the default
      // path from a previous version of the connector
      return await getFileFromPath(entry, options)
    } else {
      return file
    }
  } else {
    return await getFileFromPath(entry, options)
  }
}

async function getFileFromMetaData(
  entry,
  fileIdAttributes,
  sourceAccountIdentifier,
  slug,
) {
  log.debug(
    `Checking existence of ${calculateFileKey(entry, fileIdAttributes)}`,
  )
  const {data: files} = await client.queryAll(
    Q('io.cozy.files')
      .where({
        metadata: {
          fileIdAttributes: calculateFileKey(entry, fileIdAttributes),
        },
        trashed: false,
        cozyMetadata: {
          sourceAccountIdentifier,
          createdByApp: slug,
        },
      })
      .indexFields([
        'metadata.fileIdAttributes',
        'trashed',
        'cozyMetadata.sourceAccountIdentifier',
        'cozyMetadata.createdByApp',
      ]),
  )

  if (files && files[0]) {
    if (files.length > 1) {
      log.warn(
        `Found ${files.length} files corresponding to ${calculateFileKey(
          entry,
          fileIdAttributes,
        )}`,
      )
    }
    return files[0]
  } else {
    log.debug('not found')
    return false
  }
}

async function getFileFromPath(entry, options) {
  try {
    log.debug(`Checking existence of ${getFilePath({entry, options})}`)
    const result = await cozy.files.statByPath(getFilePath({entry, options}))
    return result
  } catch (err) {
    log.debug(err.message)
    return false
  }
}

async function createFile(entry, options, method, fileId) {
  const folder = await cozy.files.statByPath(options.folderPath)
  let createFileOptions = {
    name: getFileName(entry),
    dirID: folder._id,
  }
  if (options.contentType) {
    createFileOptions.contentType = options.contentType
  }
  createFileOptions = {
    ...createFileOptions,
    ...entry.fileAttributes,
    ...options.sourceAccountOptions,
  }

  if (options.fileIdAttributes) {
    createFileOptions = {
      ...createFileOptions,
      ...{
        metadata: {
          ...createFileOptions.metadata,
          fileIdAttributes: calculateFileKey(entry, options.fileIdAttributes),
        },
      },
    }
  }

  const toCreate = entry.filestream

  let fileDocument
  if (method === 'create') {
    fileDocument = await cozy.files.create(toCreate, createFileOptions)
  } else if (method === 'updateById') {
    log.debug(`replacing file for ${entry.filename}`)
    fileDocument = await cozy.files.updateById(
      fileId,
      toCreate,
      createFileOptions,
    )
  }

  if (options.validateFile) {
    if ((await options.validateFile(fileDocument)) === false) {
      await removeFile(fileDocument)
      throw new Error('BAD_DOWNLOADED_FILE')
    }

    if (
      options.validateFileContent &&
      !(await options.validateFileContent(fileDocument))
    ) {
      await removeFile(fileDocument)
      throw new Error('BAD_DOWNLOADED_FILE')
    }
  }

  return fileDocument
}

const defaultShouldReplaceFile = (file, entry, options) => {
  const shouldForceMetadataAttr = (attr) => {
    const result =
      !getAttribute(file, `metadata.${attr}`) &&
      get(entry, `fileAttributes.metadata.${attr}`)
    if (result) {
      log.debug(`filereplacement: adding ${attr} metadata`)
    }
    return result
  }
  // replace all files with meta if there is file metadata to add
  const fileHasNoMetadata = !getAttribute(file, 'metadata')
  const fileHasNoId = !getAttribute(file, 'metadata.fileIdAttributes')
  const entryHasMetadata = !!get(entry, 'fileAttributes.metadata')
  const hasSourceAccountIdentifierOption = !!get(
    options,
    'sourceAccountOptions.sourceAccountIdentifier',
  )
  const fileHasSourceAccountIdentifier = !!getAttribute(
    file,
    'cozyMetadata.sourceAccountIdentifier',
  )
  const result =
    (fileHasNoMetadata && entryHasMetadata) ||
    (fileHasNoId && !!options.fileIdAttributes) ||
    (hasSourceAccountIdentifierOption && !fileHasSourceAccountIdentifier) ||
    shouldForceMetadataAttr('carbonCopy') ||
    shouldForceMetadataAttr('electronicSafe') ||
    shouldForceMetadataAttr('categories')

  if (result) {
    if (fileHasNoMetadata && entryHasMetadata) {
      log.debug('filereplacement: metadata to add')
    }
    if (fileHasNoId && !!options.fileIdAttributes) {
      log.debug('filereplacement: adding fileIdAttributes')
    }
    if (hasSourceAccountIdentifierOption && !fileHasSourceAccountIdentifier) {
      log.debug('filereplacement: adding sourceAccountIdentifier')
    }
  }

  return result
}

const shouldReplaceFile = async function (file, entry, options) {
  const isValid = !options.validateFile || (await options.validateFile(file))
  if (!isValid) {
    log.warn(`${getFileName({file, options})} is invalid`)
    throw new Error('BAD_DOWNLOADED_FILE')
  }
  const shouldReplaceFileFn =
    entry.shouldReplaceFile ||
    options.shouldReplaceFile ||
    defaultShouldReplaceFile

  return shouldReplaceFileFn(file, entry, options)
}

const removeFile = async function (file) {
  await cozy.files.trashById(file._id)
  await cozy.files.destroyById(file._id)
}

module.exports = saveFiles
module.exports.getFileIfExists = getFileIfExists

function getFileName(entry) {
  let filename
  if (entry.filename) {
    filename = entry.filename
  } else {
    log.error('Could not get a file name for the entry')
    return false
  }
  return sanitizeFileName(filename)
}

function sanitizeFileName(filename) {
  return filename.replace(/^\.+$/, '').replace(/[/?<>\\:*|":]/g, '')
}

function checkFileSize(fileobject) {
  const size = getAttribute(fileobject, 'size')
  const name = getAttribute(fileobject, 'name')
  if (size === 0 || size === '0') {
    log.warn(`${name} is empty`)
    log.warn('BAD_FILE_SIZE')
    return false
  }
  return true
}

function logFileStream(fileStream) {
  if (!fileStream) {
    return
  }

  if (fileStream && fileStream.constructor && fileStream.constructor.name) {
    log.debug(
      `The fileStream attribute is an instance of ${fileStream.constructor.name}`,
    )
  } else {
    log.debug(`The fileStream attribute is a ${typeof fileStream}`)
  }
}

function getErrorStatus(err) {
  try {
    return Number(JSON.parse(err.message).errors[0].status)
  } catch (e) {
    return null
  }
}

function addValOrFnResult(entry, key, options) {
  if (entry[key]) {
    entry[key] = getValOrFnResult(entry[key], entry, options)
  }
}

function getValOrFnResult(val, ...args) {
  if (typeof val === 'function') {
    return val.apply(val, args)
  } else {
    return val
  }
}

function calculateFileKey(entry, fileIdAttributes) {
  return fileIdAttributes
    .sort()
    .map((key) => get(entry, key))
    .join('####')
}

function defaultValidateFile(fileDocument) {
  return checkFileSize(fileDocument)
}

async function defaultValidateFileContent(fileDocument) {
  if (!defaultValidateFile(fileDocument)) {
    log.warn('Wrong file type from content')
    return false
  }
  return true
}

function sanitizeEntry(entry) {
  delete entry.fetchFile
  delete entry.requestOptions
  delete entry.filestream
  delete entry.shouldReplaceFile
  return entry
}

function attachFileToEntry(entry, fileDocument) {
  entry.fileDocument = fileDocument
  return entry
}

function getFilePath({file, entry, options}) {
  const folderPath = options.folderPath
  if (file) {
    return folderPath + '/' + getAttribute(file, 'name')
  } else if (entry) {
    return folderPath + '/' + getFileName(entry)
  }
}

function getAttribute(obj, attribute) {
  return get(obj, `attributes.${attribute}`, get(obj, attribute))
}

async function getOrCreateDestinationPath(entry, saveOptions) {
  // const subPath = entry.subPath || saveOptions.subPath
  let finalPath = saveOptions.folderPath
  // if (subPath) {
  //   finalPath += '/' + subPath
  //   await mkdirp(finalPath)
  // }
  return finalPath
}

function initCozyClientJs(cozyClient) {
  const {uri} = cozyClient.stackClient
  return new Client({
    cozyURL: uri,
    token: cozyClient.stackClient.getAccessToken(),
  })
}
