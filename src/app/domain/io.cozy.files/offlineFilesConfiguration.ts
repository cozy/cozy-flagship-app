import { CozyPersistedStorageKeys, getData, storeData } from '/libs/localStore'

export interface OfflineFile {
  id: string
  rev: string
  path: string
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

export const addOfflineFileToConfiguration = async (file: OfflineFile) => {
  const files = await getOfflineFilesConfiguration()

  files.set(file.id, file)
  
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
