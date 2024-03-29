import { useClient } from 'cozy-client'

import { useAppDispatch, useAppSelector } from '/hooks/reduxHooks'
import {
  addLog as sliceAddLog,
  LogObj
} from '/redux/KonnectorState/KonnectorLogsSlice'
import {
  selectCurrentKonnector,
  setCurrentRunningKonnector,
  setCurrentRunningKonnectorJobId
} from '/redux/KonnectorState/CurrentKonnectorSlice'
import { sendKonnectorsLogs } from '/libs/konnectors/sendKonnectorsLogs'

export interface UseAddLogHook {
  addLog: (logObj: LogObj) => void
  currentRunningKonnector?: string
  processLogs: () => void
  setCurrentRunningKonnector: (slug: string) => void
  setCurrentRunningKonnectorJobId: (jobId: string | undefined) => void
}

export const useKonnectors = (): UseAddLogHook => {
  const { currentRunningKonnector } = useAppSelector(selectCurrentKonnector)
  const dispatch = useAppDispatch()
  const client = useClient()

  const doAddLog = (logObj: LogObj): void => {
    dispatch(sliceAddLog(logObj))
  }

  const doSetCurrentRunningKonnector = (slug: string): void => {
    dispatch(setCurrentRunningKonnector(slug))
  }

  const doSetCurrentRunningKonnectorJobId = (
    jobId: string | undefined
  ): void => {
    dispatch(setCurrentRunningKonnectorJobId(jobId))
  }

  const doProcessLogs = (): void => {
    if (!client) return
    void sendKonnectorsLogs(client)
  }

  return {
    addLog: doAddLog,
    currentRunningKonnector,
    processLogs: doProcessLogs,
    setCurrentRunningKonnector: doSetCurrentRunningKonnector,
    setCurrentRunningKonnectorJobId: doSetCurrentRunningKonnectorJobId
  }
}
