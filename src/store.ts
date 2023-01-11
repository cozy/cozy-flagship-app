import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import currentConnectorSlice from '/redux/ConnectorState/CurrentConnectorSlice'
import connectorLogsSlice from '/redux/ConnectorState/ConnectorLogsSlice'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage
}

const rootReducter = combineReducers({
  currentConnector: currentConnectorSlice,
  connectorLogs: connectorLogsSlice
})

const persistedReducer = persistReducer(persistConfig, rootReducter)

export const store = configureStore({
  reducer: persistedReducer
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
