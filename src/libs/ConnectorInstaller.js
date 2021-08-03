import Minilog from '@cozy/minilog'
import RNFS from 'react-native-fs'
import Gzip from '@fengweichong/react-native-gzip'

const log = Minilog('ConnectorInstaller')

Minilog.enable()

const CONNECTORS_LOCAL_PATH = RNFS.DocumentDirectoryPath + '/connectors/'

/**
 * Ensures that a connector is installed
 *
 * @param {String} options.slug - connector slug
 * @param {String} options.source - connector source or channel. Can be like git://github.com/konnectors/cozy-konnector-template.git#build-debug or registry://template/stable
 */
export const ensureConnectorIsInstalled = async ({slug, source, version}) => {
  const connectorLocalPath = CONNECTORS_LOCAL_PATH + slug
  await RNFS.mkdir(connectorLocalPath)

  const currentVersion = await getConnectorVersion({connectorLocalPath})
  if (version !== currentVersion) {
    log.info(
      `${currentVersion} !== ${version}`,
      `upgrading connector from ${source}`,
    )
    const archiveUrl = await getArchiveUrl(source)
    await downloadAndExtractArchive({
      url: archiveUrl,
      localPath: connectorLocalPath,
    })
    await cleanConnectorDirectory({connectorLocalPath})
    await setConnectorVersion({connectorLocalPath, version})
  } else {
    log.info(`${currentVersion} is already the last version no install needed`)
  }
}

/**
 * Get the content of a content script
 *
 * @param {String} options.slug - connector slug
 *
 * @returns {String} Content Script code
 */
export const getContentScriptContent = async ({slug}) => {
  const connectorLocalPath = CONNECTORS_LOCAL_PATH + slug
  const content = await RNFS.readFile(connectorLocalPath + '/webviewScript.js')
  return content
}

/**
 * Get the version of a connector given it's installation path
 *
 * @param {String} options.connectorLocalPath - Connector installation path
 *
 * @returns {String} Connector version
 */
const getConnectorVersion = async ({connectorLocalPath}) => {
  try {
    const version = await RNFS.readFile(connectorLocalPath + '/VERSION')
    return version.trim()
  } catch (err) {
    log.info('no version available in ' + connectorLocalPath, err)
    return false
  }
}

/**
 * Set the version of a connector
 *
 * @param {String} options.connectorLocalPath - Connector installation path
 * @param {String} options.version - Connector version
 */
const setConnectorVersion = async ({connectorLocalPath, version}) => {
  await RNFS.writeFile(connectorLocalPath + '/VERSION', version)
  await RNFS.writeFile(connectorLocalPath + '/' + version, version) // to make it readable in the DebugView
}

/**
 * Gets the list of connectors directories with their content
 *
 * @returns {Object}
 */
export const getConnectorsFiles = async () => {
  let result = {}
  const connectors = await RNFS.readDir(CONNECTORS_LOCAL_PATH)
  for (const connector of connectors) {
    result[connector.name] = await RNFS.readDir(connector.path)
  }

  return result
}

/**
 * Removes the connector's files
 */
export const cleanConnectorsFiles = async () => {
  const connectors = await RNFS.readDir(CONNECTORS_LOCAL_PATH)
  for (const connector of connectors) {
    await RNFS.unlink(connector.path)
  }
}

/**
 * Gets archive url
 *
 * @param {String} source - connector source or channel. Can be like git://github.com/konnectors/cozy-konnector-template.git#build-debug or registry://template/stable
 *
 * @returns {String} archive url
 */
const getArchiveUrl = async (source) => {
  let result
  if (source.includes('git://github.com')) {
    result = extractGithubSourceUrl(source)
  } else if (source.includes('registry://')) {
    result = await extractRegistrySourceUrl(source)
  } else {
    throw new Error(`getArchiveUrl: unknown source type  ${source}`)
  }
  log.debug(result, 'archiveUrl')
  return result
}

/**
 * Downloads and extracts the given url archive
 *
 * @param {String} options.url - archive url
 * @param {String} options.localPath - connector local path
 */
const downloadAndExtractArchive = async ({url, localPath}) => {
  const archiveLocalPath = localPath + '/' + url.split('/').pop() // extract file name
  const downloadJob = await RNFS.downloadFile({
    fromUrl: url,
    toFile: archiveLocalPath,
  })
  const downloadResult = await downloadJob.promise // or else won't wait for the end of the download
  log.debug(downloadResult, 'downloadResult')
  const unZipRes = await Gzip.unGzipTar(
    archiveLocalPath,
    localPath + '/unzip',
    true,
  )
  log.debug(unZipRes, 'unZipRes')
  await RNFS.unlink(archiveLocalPath)

  const firstDirectory = (await RNFS.readDir(localPath + '/unzip')).find((f) =>
    f.isDirectory(),
  )

  await RNFS.moveFile(
    firstDirectory.path + '/manifest.konnector',
    localPath + '/manifest.konnector',
  )
  await RNFS.moveFile(
    firstDirectory.path + '/webviewScript.js',
    localPath + '/webviewScript.js',
  )
}

/**
 * Cleans what remains after connector archive extraction
 *
 * @param {String} options.connectorLocalPath - connector path
 */
const cleanConnectorDirectory = async ({connectorLocalPath}) => {
  await RNFS.unlink(connectorLocalPath + '/unzip')
}

/**
 * Converts a github repository source to the corresponding tar.gz archive url
 *
 * @param {String} source - github repository source, formatted as git://github.com/konnectors/cozy-konnector-template.git#build-debug
 * @returns {String} - github archive url like https://github.com/konnectors/cozy-konnector-template/archive/refs/heads/build-debug.tar.gz
 */
export const extractGithubSourceUrl = (source) => {
  const matches = source.match(/^git:\/\/(.*)\.git(#.*)?$/)
  if (!matches) {
    throw new Error(`extractGithubUrl: Could not install ${source}`)
  }

  const [url, branch] = matches.slice(1)
  return `https://${url}/archive/refs/heads/${
    branch ? branch.replace('#', '') : 'master'
  }.tar.gz`
}

/**
 * Converts a registry source to the corresponding tar.gz archive url
 *
 * @param {String} source - registry source, formatted as registry://template/stable
 * @returns {String} - registry archive url like https://apps-registry.cozycloud.cc/registry/template/1.0.0/tarball/xxx.tar.gz
 */
export const extractRegistrySourceUrl = async (source) => {
  const matches = source.match(/^registry:\/\/(.*)$/)
  if (!matches) {
    throw new Error(`extractRegistrySourceUrl: Could not install ${source}`)
  }

  let url = 'https://apps-registry.cozycloud.cc/registry/'
  const registryUrlPart = matches[1]
  const splittedPath = registryUrlPart.split('/')
  if (splittedPath.length === 3) {
    // slug/channel/versionOrLatest
    const [slug, channel, versionOrLatest] = splittedPath
    const isVersion = versionOrLatest.match(/^\d/)
    if (isVersion) {
      url += `${slug}/${versionOrLatest}`
    } else {
      url += `${slug}/${channel}/latest`
    }
  } else if (splittedPath.length === 2) {
    // slug/channel or slug/version
    const [slug, channelOrVersion] = splittedPath
    const isVersion = channelOrVersion.match(/^\d/)
    url += `${slug}/${channelOrVersion}`
    if (!isVersion) {
      url += '/latest'
    }
  } else if (splittedPath.length === 1) {
    // slug
    const [slug] = splittedPath
    url += `${slug}/stable/latest`
  } else {
    throw new Error(
      `extractRegistrySourceUrl: Could not parse ${registryUrlPart}`,
    )
  }

  const response = await fetch(url)
  const json = await response.json()
  return json.url
}
