import { configureStore } from '@reduxjs/toolkit'
import currentConnectorSlice from '/redux/ConnectorState/CurrentConnectorSlice'
import connectorLogsSlice from '/redux/ConnectorState/ConnectorLogsSlice'

export const store = configureStore({
  reducer: {
    currentConnector: currentConnectorSlice,
    connectorLogs: connectorLogsSlice
  }
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
