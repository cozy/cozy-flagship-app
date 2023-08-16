import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactElement
} from 'react'

import { EventEmitter } from 'events'

import {
  ReceivedFile,
  RECEIVED_NEW_FILES
} from '/app/domain/sharing/models/ReceivedFile'
import {
  handleReceivedFiles,
  sharingLogger
} from '/app/domain/sharing/services/SharingService'

export const FileContext = createContext<ReceivedFile[]>([])
const eventEmitter = new EventEmitter()
export const useSharingFiles = (): ReceivedFile[] => useContext(FileContext)

export const SharingProvider = ({
  children
}: {
  children: ReactElement
}): JSX.Element => {
  const [filesToUpload, setFilesToUpload] = useState<ReceivedFile[]>([])

  const eventCallback = (files: ReceivedFile[]): void => {
    sharingLogger.info(`SharingProvider Received ${files.length} new files`)
    setFilesToUpload(files)
  }

  useEffect(() => {
    // Start listening for incoming files
    handleReceivedFiles((files: ReceivedFile[]) => {
      sharingLogger.info('Emitting received files', files)
      eventEmitter.emit(RECEIVED_NEW_FILES, files)
    })
  }, [])

  useEffect(() => {
    sharingLogger.info(filesToUpload)
  }, [filesToUpload])

  useEffect(() => {
    // Subscribe to the custom event
    const subscription = eventEmitter.addListener(
      RECEIVED_NEW_FILES,
      eventCallback
    )

    // Clean up the event subscription on unmount
    return () => {
      sharingLogger.info('SharingProvider Unsubscribing from event')
      subscription.removeListener(RECEIVED_NEW_FILES, eventCallback)
    }
  }, [])

  return (
    <FileContext.Provider value={filesToUpload}>
      {children}
    </FileContext.Provider>
  )
}
