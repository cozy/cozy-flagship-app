import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '/redux/store'

export interface LogObj {
  msg: string
  timestamp: string
  level: string
  slug: string
}

type LogDict = Record<string, LogObj[] | undefined>

export interface KonnectorLogsState {
  logs: LogDict
}

export interface removeLogInfo {
  slug: string
  number: number
}

const initialState: KonnectorLogsState = {
  logs: {}
}

export const konnectorLogsSlice = createSlice({
  name: 'konnectorLogs',
  initialState,
  reducers: {
    addLog: (state, action: PayloadAction<LogObj>) => {
      const log = { ...action.payload }
      if (state.logs[log.slug] === undefined) {
        state.logs[log.slug] = []
      }
      if (typeof log.msg !== 'string') {
        log.msg = JSON.stringify(log.msg)
      }

      state.logs[log.slug]?.push(log)
    },
    removeLogs: (state, action: PayloadAction<removeLogInfo>) => {
      const result = state.logs[action.payload.slug]?.slice(
        action.payload.number
      )
      if (result?.length) {
        state.logs[action.payload.slug] = result
      } else {
        // Locally disable the rule because we delete the dynamic `[action.payload.slug]` property with a destructuring assignment
        /* eslint "@typescript-eslint/no-unused-vars" : ["warn", { "ignoreRestSiblings": true }] */
        const { [action.payload.slug]: _, ...rest } = state.logs
        state.logs = rest
      }
    },
    clearLogs: state => {
      state.logs = {}
    }
  }
})

export const { addLog, clearLogs, removeLogs } = konnectorLogsSlice.actions

export const selectKonnectorLogs = (state: RootState): KonnectorLogsState =>
  state.konnectorLogs

export default konnectorLogsSlice.reducer
