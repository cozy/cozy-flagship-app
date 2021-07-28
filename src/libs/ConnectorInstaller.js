import Minilog from '@cozy/minilog'
import RNFS from 'react-native-fs'
import Gzip from '@fengweichong/react-native-gzip'

const log = Minilog('ConnectorInstaller')

Minilog.enable()

const CONNECTORS_LOCAL_PATH = RNFS.DocumentDirectoryPath + '/connectors/'

/**
 * Ensures that a connector is installed and returns the content of content script
 *
 * @param {String} options.slug - connector slug
 * @param {String} options.source - connector source or channel. Can be like git://github.com/konnectors/cozy-konnector-template.git#build-debug or registry://template/stable
 *
 * @returns {String} Content Script code
 */
export const ensureConnectorIsInstalled = async ({slug, source}) => {
  const connectorLocalPath = CONNECTORS_LOCAL_PATH + slug
  await RNFS.mkdir(connectorLocalPath)

  const archiveUrl = getArchiveUrl(source)
  const unzipPath = await downloadAndExtractArchive({
    url: archiveUrl,
    localPath: connectorLocalPath,
  })
  await cleanConnectorDirectory({connectorLocalPath, unzipPath})

  const content = await RNFS.readFile(connectorLocalPath + '/webviewScript.js')
  return content
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
const getArchiveUrl = (source) => {
  let result
  if (source.includes('git://github.com')) {
    result = extractGithubSourceUrl(source)
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
 *
 * @returns {String} extracted zip file path
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
  return localPath + '/unzip'
}

/**
 * Gets extracted files from extracted archive and cleans what remains
 *
 * @param {String} options.connectorLocalPath - connector path
 * @param {String} options.unzipPath - unzipped archive path
 */
const cleanConnectorDirectory = async ({connectorLocalPath, unzipPath}) => {
  const firstDirectory = (await RNFS.readDir(unzipPath)).find((f) =>
    f.isDirectory(),
  )

  await RNFS.moveFile(
    firstDirectory.path + '/manifest.konnector',
    connectorLocalPath + '/manifest.konnector',
  )
  await RNFS.moveFile(
    firstDirectory.path + '/webviewScript.js',
    connectorLocalPath + '/webviewScript.js',
  )

  await RNFS.unlink(unzipPath)
}

/**
 * Convert a github repository source to the corresponding tar.gz archive url
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
