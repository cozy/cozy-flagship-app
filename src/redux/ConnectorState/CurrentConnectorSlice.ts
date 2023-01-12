import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '/redux/store'

export interface CurrentConnectorState {
  currentRunningConnector?: string
}

const initialState: CurrentConnectorState = {
  currentRunningConnector: undefined
}

export const currentConnectorSlice = createSlice({
  name: 'currentConnector',
  initialState,
  reducers: {
    setCurrentRunningConnector: (state, action: PayloadAction<string>) => {
      state.currentRunningConnector = action.payload
    }
  }
})

export const { setCurrentRunningConnector } = currentConnectorSlice.actions

export const selectCurrentConnector = (
  state: RootState
): CurrentConnectorState => state.currentConnector

export default currentConnectorSlice.reducer
