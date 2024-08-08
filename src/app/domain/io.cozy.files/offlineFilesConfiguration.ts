import { CozyPersistedStorageKeys, getData, storeData } from '/libs/localStore'

export interface OfflineFile {
  id: string
  rev: string
  path: string
  lastOpened: Date
}

export type OfflineFilesConfiguration = Map<string, OfflineFile>
export type SerializedOfflineFilesConfiguration = [string, OfflineFile][]

export const getOfflineFilesConfiguration =
  async (): Promise<OfflineFilesConfiguration> => {
    const filesArray = await getData<OfflineFilesConfiguration>(
      CozyPersistedStorageKeys.OfflineFiles
    )

    const files = new Map(filesArray)

    return files
  }

export const addOfflineFileToConfiguration = async (
  file: Omit<OfflineFile, 'lastOpened'>
): Promise<void> => {
  const files = await getOfflineFilesConfiguration()

  files.set(file.id, {
    ...file,
    lastOpened: new Date()
  })

  const filesArray = Array.from(files.entries())

  return storeData(CozyPersistedStorageKeys.OfflineFiles, filesArray)
}

export const removeOfflineFileFromConfiguration = async (
  fileId: string
): Promise<void> => {
  const files = await getOfflineFilesConfiguration()

  files.delete(fileId)

  const filesArray = Array.from(files.entries())

  return storeData(CozyPersistedStorageKeys.OfflineFiles, filesArray)
}

export const getOfflineFileFromConfiguration = async (
  fileId: string
): Promise<OfflineFile | undefined> => {
  const files = await getOfflineFilesConfiguration()

  if (files.has(fileId)) {
    return files.get(fileId)
  }

  return undefined
}

export const updateLastOpened = async (fileId: string): Promise<void> => {
  const file = await getOfflineFileFromConfiguration(fileId)

  if (!file) {
    throw new Error(
      `Cannot update 'lastOpened' attribute for not existing file ${fileId}`
    )
  }

  file.lastOpened = new Date()

  await addOfflineFileToConfiguration(file)
}
