import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore
} from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import logger from 'redux-logger'

import konnectorLogsSlice from '/redux/KonnectorState/KonnectorLogsSlice'
import currentKonnectorSlice from '/redux/KonnectorState/CurrentKonnectorSlice'
import { shouldEnableReduxLogger } from '/core/tools/env'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage
}

const rootReducter = combineReducers({
  currentKonnector: currentKonnectorSlice,
  konnectorLogs: konnectorLogsSlice
})

const persistedReducer = persistReducer(persistConfig, rootReducter)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE]
      }
    })

    if (shouldEnableReduxLogger()) {
      middlewares.push(logger)
    }

    return middlewares
  }
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
