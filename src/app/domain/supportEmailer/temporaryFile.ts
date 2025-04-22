import { format } from 'date-fns'
import RNFS from 'react-native-fs'

import CozyClient from 'cozy-client'

import { getInstanceAndFqdnFromClient } from '/libs/client'
import { normalizeFqdn } from '/libs/functions/stringHelpers'

export const saveToTempDir = async (
  client: CozyClient,
  filePath: string,
  fileName: string
): Promise<string> => {
  const tempFolderPath = getTempFolderPath(client)

  await RNFS.mkdir(tempFolderPath)

  const date = format(new Date(), 'yyyyMMdd_HHmmss_SSS')
  const destFolderPath = `${tempFolderPath}/${date}`

  await RNFS.mkdir(destFolderPath)

  const destPath = `${destFolderPath}/${fileName}`

  await RNFS.copyFile(filePath, destPath)

  return destPath
}

export const cleanTempDir = async (client: CozyClient): Promise<void> => {
  const tempFolderPath = getTempFolderPath(client)

  if (await RNFS.exists(tempFolderPath)) {
    await RNFS.unlink(tempFolderPath)
  }
}

const getTempFolderPath = (client: CozyClient): string => {
  const { fqdn } = getInstanceAndFqdnFromClient(client)

  const normalizedFqdn = normalizeFqdn(fqdn)

  const tempFolderPath = `${RNFS.DocumentDirectoryPath}/${normalizedFqdn}/SupportTemp`

  return tempFolderPath
}
