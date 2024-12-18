import { formatISO, parseISO } from 'date-fns'

import { CozyPersistedStorageKeys, getData, storeData } from '/libs/localStore'

export interface OfflineFile {
  id: string
  rev: string
  path: string
  lastOpened: Date
}

interface SerializedOfflineFile {
  id: string
  rev: string
  path: string
  lastOpened: string
}

export type OfflineFilesConfiguration = Map<string, OfflineFile>
export type SerializedOfflineFilesConfiguration = [
  string,
  SerializedOfflineFile
][]

export const getOfflineFilesConfiguration =
  async (): Promise<OfflineFilesConfiguration> => {
    const serializedFilesArray =
      await getData<SerializedOfflineFilesConfiguration>(
        CozyPersistedStorageKeys.OfflineFiles
      )

    const files = serializedToConfiguration(serializedFilesArray)

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

  const filesArray = configurationToSerialized(files)

  return storeData(CozyPersistedStorageKeys.OfflineFiles, filesArray)
}

export const removeOfflineFileFromConfiguration = async (
  fileId: string
): Promise<void> => {
  const files = await getOfflineFilesConfiguration()

  files.delete(fileId)

  const filesArray = configurationToSerialized(files)

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

const serializedToConfiguration = (
  serializedConfiguration: SerializedOfflineFilesConfiguration | null
): OfflineFilesConfiguration => {
  const configurationArray = serializedConfiguration?.map(([key, file]) => {
    const parsedFile = {
      ...file,
      lastOpened: file.lastOpened ? parseISO(file.lastOpened) : null
    }

    return [key, parsedFile] as [string, OfflineFile]
  })

  return new Map(configurationArray)
}

const configurationToSerialized = (
  configuration: OfflineFilesConfiguration
): SerializedOfflineFilesConfiguration => {
  return Array.from(configuration.entries()).map(([key, file]) => {
    const parsedFile = {
      ...file,
      lastOpened: file.lastOpened ? formatISO(file.lastOpened) : ''
    }

    return [key, parsedFile] as [string, SerializedOfflineFile]
  })
}
