import Minilog from '@cozy/minilog'
import CozyClient from 'cozy-client'
import FileViewer from 'react-native-file-viewer'
import RNFS from 'react-native-fs'

const log = Minilog('ReloadInterceptorWebView')

/**
 * Represents a link like `/files/downloads/:secret/:name`
 */
export const PUBLIC_BY_SECRET_DOWNLOAD_LINK = 'PUBLIC_BY_SECRET_DOWNLOAD_LINK'

/**
 * Represents a link like `/files/download?Path=XXX`
 */
export const PRIVATE_BY_PATH_DOWNLOAD_LINK = 'PRIVATE_BY_PATH_DOWNLOAD_LINK'

type PreviewType =
  | typeof PUBLIC_BY_SECRET_DOWNLOAD_LINK
  | typeof PRIVATE_BY_PATH_DOWNLOAD_LINK
  | false

/**
 * Check if the providen link is a download link from the Cozy
 *
 * Following links are previewable:
 * - `/files/downloads/:secret/:name` (see [documentation](https://docs.cozy.io/en/cozy-stack/files/#get-filesdownloadssecretname))
 * - `/files/download?Path=XXX` (see [documentation](https://docs.cozy.io/en/cozy-stack/files/#get-filesdownload))
 *
 * Following links are not implemented:
 * - `/files/download/:file-id` (see [documentation](https://docs.cozy.io/en/cozy-stack/files/#get-filesdownloadfile-id))
 * - `/files/archive/:key/:name` (see [documentation](https://docs.cozy.io/en/cozy-stack/files/#get-filesarchivekeyname))
 *
 * @param link - the link to be analyzed
 * @param client - CozyClient instance
 * @returns false if the link is not previewable, or the link type
 */
export const checkIsPreviewableLink = (
  link: string,
  client: typeof CozyClient
): PreviewType => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const cozyUrl = new URL(client.getStackClient().uri)

  const previewLink = new URL(link)

  if (previewLink.pathname.startsWith('/files/downloads/')) {
    return PUBLIC_BY_SECRET_DOWNLOAD_LINK
  }

  if (
    previewLink.host === cozyUrl.host &&
    previewLink.pathname === '/files/download' &&
    previewLink.searchParams.has('Path')
  ) {
    return PRIVATE_BY_PATH_DOWNLOAD_LINK
  }

  return false
}

/**
 * Download the specified file and display it through native file viewer
 */
export const previewFileFromDownloadUrl = async ({
  downloadUrl,
  client,
  setDownloadProgress
}: {
  downloadUrl: string
  client: typeof CozyClient
  setDownloadProgress: React.Dispatch<React.SetStateAction<number>>
}): Promise<void> => {
  try {
    const previewType = checkIsPreviewableLink(downloadUrl, client)

    if (previewType === false) {
      throw new Error('Think link cannot be previewed')
    }

    const fileName = getFileNameFromCozyDownloadUrl(downloadUrl, previewType)

    if (!fileName) {
      throw new Error('Impossible to extract fileName from download URL')
    }

    const filePath = await downloadFile({
      fileName,
      downloadUrl,
      previewType,
      client,
      setDownloadProgress
    })

    await FileViewer.open(filePath)
  } catch (err) {
    if (err instanceof Error) {
      log.error(`Error while downloading file for preview: ${err.message}`)
    }
    throw err
  }
}

const getFileNameFromPrivateByPathDownloadLink = (
  downloadUrl: string
): string => {
  const url = new URL(downloadUrl)

  if (!url.searchParams.has('Path')) {
    throw new Error(
      'PUBLIC_BY_SECRET_DOWNLOAD_LINK links should contain a Path parameter'
    )
  }

  return url.searchParams.get('Path')?.split('/').pop() ?? ''
}

const getFileNameFromPublicBySecretDownloadLink = (
  downloadUrl: string
): string => {
  const url = new URL(downloadUrl)

  return url.pathname.split('/').pop() ?? ''
}

const getFileNameFromCozyDownloadUrl = (
  downloadUrl: string,
  previewType: PreviewType
): string | undefined => {
  if (previewType === PUBLIC_BY_SECRET_DOWNLOAD_LINK) {
    return getFileNameFromPublicBySecretDownloadLink(downloadUrl)
  }

  if (previewType === PRIVATE_BY_PATH_DOWNLOAD_LINK) {
    return getFileNameFromPrivateByPathDownloadLink(downloadUrl)
  }

  throw new Error(`No fileName can be extracted from ${downloadUrl}`)
}

export const getFileExtentionFromCozyDownloadUrl = (
  downloadUrl: string,
  previewType: PreviewType
): string | undefined => {
  const fileName = getFileNameFromCozyDownloadUrl(downloadUrl, previewType)

  const fileExtension = fileName?.split('.').pop()

  return fileExtension?.toLocaleLowerCase()
}

const downloadFile = async ({
  fileName,
  downloadUrl,
  previewType,
  client,
  setDownloadProgress
}: {
  fileName: string
  downloadUrl: string
  previewType: PreviewType
  client: typeof CozyClient
  setDownloadProgress: React.Dispatch<React.SetStateAction<number>>
}): Promise<string> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const stackClient = client.getStackClient()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const headers = stackClient.getAuthorizationHeader()

  const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`
  const result = await RNFS.downloadFile({
    fromUrl: downloadUrl,
    toFile: destinationPath,
    begin: () => undefined,
    progress: res => {
      const progressPercent = res.bytesWritten / res.contentLength
      setDownloadProgress(progressPercent)
    },
    progressInterval: 100,
    headers:
      previewType === PRIVATE_BY_PATH_DOWNLOAD_LINK
        ? {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            Authorization: headers
          }
        : undefined
  }).promise

  log.debug(`Donload result is ${JSON.stringify(result)}`)

  const { statusCode } = result

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(`Status code: ${statusCode}`)
  }

  setDownloadProgress(0)

  return destinationPath
}
