import { render } from '@testing-library/react-native'
import React, { useEffect } from 'react'
import { Text } from 'react-native'

import { ReceivedFile } from '/app/domain/sharing/models/ReceivedFile'
import { SharingIntentStatus } from '/app/domain/sharing/models/ReceivedIntent'
import {
  sharingReducer,
  SharingProvider,
  useSharingState,
  SharingState,
  SharingAction,
  useSharingDispatch
} from '/app/view/sharing/SharingProvider'

type TestAction = SharingAction | { type: 'UNKNOWN_ACTION'; payload: string }

describe('sharingReducer', () => {
  let initialState: SharingState

  beforeEach(() => {
    initialState = {
      SharingIntentStatus: null,
      filesToUpload: [],
      isSharingExpected: false,
      isSharingReady: false
    }
  })

  it('should handle SET_INTENT_STATUS', () => {
    const action: SharingAction = {
      type: 'SET_INTENT_STATUS',
      payload: SharingIntentStatus.Undetermined
    }

    const newState = sharingReducer(initialState, action)
    expect(newState.SharingIntentStatus).toEqual(
      SharingIntentStatus.Undetermined
    )
  })

  it('should throw error for unknown action', () => {
    const action: TestAction = {
      type: 'UNKNOWN_ACTION',
      payload: 'somePayload'
    }

    expect(() => {
      const testReducer = sharingReducer as (
        state: SharingState,
        action: TestAction
      ) => SharingState
      testReducer(initialState, action)
    }).toThrow('Unexpected object')
  })

  it('should handle SET_FILES_TO_UPLOAD', () => {
    const testFiles = [
      { name: 'file1.txt' },
      { name: 'file2.txt' }
    ] as unknown as ReceivedFile[]
    const action: SharingAction = {
      type: 'SET_FILES_TO_UPLOAD',
      payload: testFiles
    }

    const newState = sharingReducer(initialState, action)
    expect(newState.filesToUpload).toEqual(testFiles)
  })

  it('should handle SET_SHARING_EXPECTED', () => {
    const action: SharingAction = {
      type: 'SET_SHARING_EXPECTED',
      payload: true
    }

    const newState = sharingReducer(initialState, action)
    expect(newState.isSharingExpected).toEqual(true)
  })

  it('should handle SET_SHARING_READY', () => {
    const action: SharingAction = {
      type: 'SET_SHARING_READY',
      payload: true
    }

    const newState = sharingReducer(initialState, action)
    expect(newState.isSharingReady).toEqual(true)
  })
})

describe('SharingProvider', () => {
  it('provides initial state to children', () => {
    const TestComponent = (): JSX.Element => {
      const state = useSharingState()
      return <Text>{state.isSharingReady ? 'Ready' : 'Not Ready'}</Text>
    }

    const { getByText } = render(
      <SharingProvider>
        <TestComponent />
      </SharingProvider>
    )

    expect(getByText('Not Ready')).toBeTruthy()
  })

  it('provides dispatch to children', () => {
    const TestComponent = (): JSX.Element => {
      const dispatch = useSharingDispatch()
      const state = useSharingState()

      // Simulate a dispatch action
      useEffect(() => {
        dispatch({ type: 'SET_SHARING_READY', payload: true })
      }, [dispatch])

      return <Text>{state.isSharingReady ? 'Ready' : 'Not Ready'}</Text>
    }

    const { getByText } = render(
      <SharingProvider>
        <TestComponent />
      </SharingProvider>
    )

    expect(getByText('Ready')).toBeTruthy()
  })
})

describe('SharingReducer and SharingProvider interaction', () => {
  it('handles sequence of actions correctly', () => {
    const TestComponent = (): JSX.Element => {
      const dispatch = useSharingDispatch()
      const state = useSharingState()

      // Simulate a sequence of actions
      useEffect(() => {
        dispatch({
          type: 'SET_INTENT_STATUS',
          payload: SharingIntentStatus.Undetermined
        })
        dispatch({
          type: 'SET_FILES_TO_UPLOAD',
          payload: [{ name: 'file1.txt' }] as unknown as ReceivedFile[]
        })
        dispatch({ type: 'SET_SHARING_READY', payload: true })
      }, [dispatch])

      return (
        <Text>
          {state.isSharingReady && state.filesToUpload.length > 0
            ? 'Ready with files'
            : 'Not Ready'}
        </Text>
      )
    }

    const { getByText } = render(
      <SharingProvider>
        <TestComponent />
      </SharingProvider>
    )

    expect(getByText('Ready with files')).toBeTruthy()
  })
})
