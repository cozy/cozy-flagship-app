import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '/store'

interface ConnectorLogsState {
  logs: string[]
}

const initialState: ConnectorLogsState = {
  logs: []
}

export const connectorLogsSlice = createSlice({
  name: 'connectorLogs',
  initialState,
  reducers: {
    addLog: (state, action: PayloadAction<string>) => {
      state.logs = [...state.logs, action.payload]
    },
    spliceLogs: (state, action: PayloadAction<number>) => {
      state.logs = state.logs.slice(action.payload)
    },
    clearLogs: state => {
      state.logs = []
    }
  }
})

export const { addLog, clearLogs, spliceLogs } = connectorLogsSlice.actions

export const selectConnectorLogs = (state: RootState): ConnectorLogsState =>
  state.connectorLogs

export default connectorLogsSlice.reducer
