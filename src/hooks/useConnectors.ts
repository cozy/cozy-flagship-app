import { useClient } from 'cozy-client'

import { useAppDispatch, useAppSelector } from '/hooks/reduxHooks'
import { addLog as sliceAddLog } from '/redux/ConnectorState/ConnectorLogsSlice'
import {
  selectCurrentConnector,
  setCurrentRunningConnector
} from '/redux/ConnectorState/CurrentConnectorSlice'
import { sendConnectorsLogs } from '/libs/connectors/sendConnectorsLogs'

export interface UseAddLogHook {
  addLog: () => void
  currentRunningConnector?: string
  processLogs: () => void
  setCurrentRunningConnector: (slug: string) => void
}

export const useConnectors = (): UseAddLogHook => {
  const { currentRunningConnector } = useAppSelector(selectCurrentConnector)
  const dispatch = useAppDispatch()
  const client = useClient()

  const doAddLog = (): void => {
    // TODO: Implement ADD logic
    dispatch(sliceAddLog('SOME_LOG'))
  }

  const doSetCurrentRunningConnector = (slug: string): void => {
    dispatch(setCurrentRunningConnector(slug))
  }

  const doProcessLogs = (): void => {
    void sendConnectorsLogs(client, 5)
  }

  return {
    addLog: doAddLog,
    currentRunningConnector,
    processLogs: doProcessLogs,
    setCurrentRunningConnector: doSetCurrentRunningConnector
  }
}
