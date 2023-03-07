import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '/redux/store'

export interface CurrentKonnectorState {
  currentRunningKonnector?: string
  currentRunningKonnectorJobId?: string
}

const initialState: CurrentKonnectorState = {
  currentRunningKonnector: undefined,
  currentRunningKonnectorJobId: undefined
}

export const currentKonnectorSlice = createSlice({
  name: 'currentKonnector',
  initialState,
  reducers: {
    setCurrentRunningKonnector: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.currentRunningKonnector = action.payload
    },
    setCurrentRunningKonnectorJobId: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.currentRunningKonnectorJobId = action.payload
    }
  }
})

export const { setCurrentRunningKonnector, setCurrentRunningKonnectorJobId } =
  currentKonnectorSlice.actions

export const selectCurrentKonnector = (
  state: RootState
): CurrentKonnectorState => state.currentKonnector

export default currentKonnectorSlice.reducer
