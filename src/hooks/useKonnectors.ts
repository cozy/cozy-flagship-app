import { useClient } from 'cozy-client'

import { useAppDispatch, useAppSelector } from '/hooks/reduxHooks'
import {
  addLog as sliceAddLog,
  LogObj
} from '/redux/ConnectorState/ConnectorLogsSlice'
import {
  selectCurrentConnector,
  setCurrentRunningConnector
} from '/redux/ConnectorState/CurrentConnectorSlice'
import { sendConnectorsLogs } from '/libs/connectors/sendConnectorsLogs'

export interface UseAddLogHook {
  addLog: (logObj: LogObj) => void
  currentRunningConnector?: string
  processLogs: () => void
  setCurrentRunningConnector: (slug: string) => void
}

export const useConnectors = (): UseAddLogHook => {
  const { currentRunningConnector } = useAppSelector(selectCurrentConnector)
  const dispatch = useAppDispatch()
  const client = useClient()

  const doAddLog = (logObj: LogObj): void => {
    dispatch(sliceAddLog(logObj))
  }

  const doSetCurrentRunningConnector = (slug: string): void => {
    dispatch(setCurrentRunningConnector(slug))
  }

  const doProcessLogs = (): void => {
    void sendConnectorsLogs(client)
  }

  return {
    addLog: doAddLog,
    currentRunningConnector,
    processLogs: doProcessLogs,
    setCurrentRunningConnector: doSetCurrentRunningConnector
  }
}
