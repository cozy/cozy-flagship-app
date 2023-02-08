import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { RootState } from '/redux/store'

export interface ConnectorUrlsState {
  urls: string[]
}

const initialState: ConnectorUrlsState = {
  urls: []
}

export const connectorUrlsSlice = createSlice({
  name: 'connectorUrls',
  initialState,
  reducers: {
    updateList: (state, action: PayloadAction<string>) => {
      state.urls = Array.from(new Set([...state.urls, action.payload]))
    },
    clearList: state => {
      state.urls = []
    },
    removeUrlFromStore: (state, action: PayloadAction<string>) => {
      state.urls = state.urls.filter(url => url !== action.payload)
    }
  }
})

export const { updateList, clearList, removeUrlFromStore } =
  connectorUrlsSlice.actions

export const selectConnectorUrls = (state: RootState): ConnectorUrlsState =>
  state.connectorUrls

export default connectorUrlsSlice.reducer
