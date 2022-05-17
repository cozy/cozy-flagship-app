import RNFS from 'react-native-fs'

import {
  getBaseFolderForFqdnAndSlug,
  getBaseRelativePathForFqdnAndSlug
} from './httpPaths'
import { prepareAssets } from './copyAllFilesFromBundleAssets'
import { replaceAll } from '../functions/stringHelpers'

export const getIndexForFqdnAndSlug = async (fqdn, slug) => {
  const basePath = getBaseFolderForFqdnAndSlug(fqdn, slug)

  await prepareAssets(basePath)

  const indexPath = basePath + '/index.html'

  const fileContent = await RNFS.readFile(indexPath)

  return fileContent
}

export const fillIndexWithData = ({
  fqdn,
  slug,
  port,
  securityKey,
  indexContent,
  indexData
}) => {
  let output = indexContent

  const basePath = getBaseRelativePathForFqdnAndSlug(fqdn, slug)

  const absoluteUrlBasePath = `http://localhost:${port}/${securityKey}${basePath}`
  output = replaceRelativeUrlsWithAbsoluteUrls(output, absoluteUrlBasePath)
  output = replaceProtocolRelativeUrlsWithAbsoluteUrls(
    output,
    absoluteUrlBasePath
  )

  Object.entries(indexData).forEach(([key, value]) => {
    output = replaceAll(output, `{{.${key}}}`, value)
  })

  return output
}

const replaceRelativeUrlsWithAbsoluteUrls = (str, absoluteUrlBasePath) => {
  return str
    .replace(/href="\/(?!\/)/g, `href="${absoluteUrlBasePath}/`)
    .replace(/src="\/(?!\/)/g, `src="${absoluteUrlBasePath}/`)
}

const replaceProtocolRelativeUrlsWithAbsoluteUrls = (
  str,
  absoluteUrlBasePath
) => {
  return str
    .replace(/href="(?!http|\/\/)/g, `href="${absoluteUrlBasePath}/`)
    .replace(/src="(?!http|\/\/)/g, `src="${absoluteUrlBasePath}/`)
}
