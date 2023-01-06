import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '/redux/store'

export interface LogObj {
  msg: string
  timestamp: string
  level: string
  slug: string
}

type LogDict = Record<string, LogObj[] | undefined>

export interface ConnectorLogsState {
  logs: LogDict
}

export interface removeLogInfo {
  slug: string
  number: number
}

const initialState: ConnectorLogsState = {
  logs: {}
}

export const connectorLogsSlice = createSlice({
  name: 'connectorLogs',
  initialState,
  reducers: {
    addLog: (state, action: PayloadAction<LogObj>) => {
      if (state.logs[action.payload.slug] === undefined) {
        state.logs[action.payload.slug] = []
      }
      state.logs[action.payload.slug]?.push(action.payload)
    },
    removeLogs: (state, action: PayloadAction<removeLogInfo>) => {
      const result = state.logs[action.payload.slug]?.slice(
        action.payload.number
      )
      if (result?.length) {
        state.logs[action.payload.slug] = result
      } else {
        delete state.logs[action.payload.slug]
      }
    },
    clearLogs: state => {
      state.logs = {}
    }
  }
})

export const { addLog, clearLogs, removeLogs } = connectorLogsSlice.actions

export const selectConnectorLogs = (state: RootState): ConnectorLogsState =>
  state.connectorLogs

export default connectorLogsSlice.reducer
