import { CozyPersistedStorageKeys, getData, storeData } from "/libs/localStore"

export interface OfflineFile {
  id: string
  rev: string
  path: string
}

export type OfflineFilesConfiguration = Map<string, OfflineFile>
export type SerializedOfflineFilesConfiguration = [string, OfflineFile][]

export const getOfflineFilesConfiguration = async () => {
  const filesArray = await getData<OfflineFilesConfiguration>(CozyPersistedStorageKeys.OfflineFiles)

  const files = new Map(filesArray)

  return files
}

export const addOfflineFileToConfiguration = async (file: OfflineFile) => {
  let files = await getOfflineFilesConfiguration()

  if (files === null) {
    files = new Map<string, OfflineFile>()
  }

  files.set(file.id, file)
  
  const filesArray = Array.from(files.entries())
  
  return storeData(CozyPersistedStorageKeys.OfflineFiles, filesArray)
}

export const removeOfflineFileFromConfiguration = async (fileId: string) => {
  let files = await getOfflineFilesConfiguration()

  if (files === null) {
    return
  }

  files.delete(fileId)

  const filesArray = Array.from(files.entries())
  
  return storeData(CozyPersistedStorageKeys.OfflineFiles, filesArray)
}

export const getOfflineFileFromConfiguration = async (fileId: string) => {
  const files = await getOfflineFilesConfiguration()

  if (files?.has(fileId)) {
    return files.get(fileId)
  }

  return null
}
