import { useEffect } from 'react'

import { useNativeIntent } from 'cozy-intent'

import {
  useOsReceiveDispatch,
  useOsReceiveState
} from '/app/view/OsReceive/OsReceiveState'
import { OsReceiveLogger } from '/app/domain/osReceive'
import {
  OsReceiveActionType,
  OsReceiveFile,
  OsReceiveFileStatus
} from '/app/domain/osReceive/models/OsReceiveState'

export const useOsReceiveApi = (): void => {
  const state = useOsReceiveState()
  const nativeIntent = useNativeIntent()
  const dispatch = useOsReceiveDispatch()

  useEffect(() => {
    // If there's no native intent, we can't send messages
    if (!nativeIntent) {
      OsReceiveLogger.error('Native intent not available')
      return
    }

    // Predicate function to check if a file is handled
    const isFileHandled = (file: OsReceiveFile): boolean =>
      file.status === OsReceiveFileStatus.uploaded ||
      file.status === OsReceiveFileStatus.error

    // Function to determine the most recent file
    const getMostRecentFile = (
      recentFile: OsReceiveFile,
      currentFile: OsReceiveFile
    ): OsReceiveFile =>
      !recentFile.handledTimestamp ||
      (currentFile.handledTimestamp &&
        currentFile.handledTimestamp > recentFile.handledTimestamp)
        ? currentFile
        : recentFile

    // Find the most recently handled file if any (uploaded or errored)
    const handledFiles = state.filesToUpload.filter(isFileHandled)

    // Initialize a variable to store the most recently handled file
    let mostRecentlyHandledFile: OsReceiveFile | null = null

    // Update mostRecentlyHandledFile if there are any handled files
    if (handledFiles.length > 0) {
      mostRecentlyHandledFile = handledFiles.reduce(getMostRecentFile)
    }

    const isLastFileHandled = state.filesToUpload.every(isFileHandled)

    // Send message for the most recently handled file
    const sendMessageForFile = async (file: OsReceiveFile): Promise<void> => {
      try {
        if (!state.routeToUpload.href) throw new Error('No route to upload')

        await nativeIntent.call(state.routeToUpload.href, 'onFileUploaded', {
          ...file,
          isLastFileHandled
        })
      } catch (error) {
        OsReceiveLogger.error('sendMessageForFile error', error)

        dispatch({
          type: OsReceiveActionType.SetFlowErrored,
          payload: true
        })
      }
    }

    // If there's a most recently handled file, send message
    if (mostRecentlyHandledFile?.handledTimestamp) {
      void sendMessageForFile(mostRecentlyHandledFile)
    }
  }, [dispatch, nativeIntent, state])
}
