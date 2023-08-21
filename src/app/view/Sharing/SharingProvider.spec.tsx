import React from 'react'
import { render } from '@testing-library/react-native'
import { Text } from 'react-native'

import {
  SharingProvider,
  useSharingState
} from '/app/view/Sharing/SharingProvider'
import { handleReceivedFiles } from '/app/domain/sharing/services/SharingData'
import { handleSharing } from '/app/domain/sharing/services/SharingStatus'
import { SharingIntentStatus } from '/app/domain/sharing/models/SharingState'
import { ReceivedFile } from '/app/domain/sharing/models/ReceivedFile'

jest.mock('/app/domain/sharing/services/SharingData')
jest.mock('/app/domain/sharing/services/SharingStatus')

describe('SharingProvider', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;(handleReceivedFiles as jest.Mock).mockClear()
    ;(handleSharing as jest.Mock).mockClear()
  })

  it('calls services and updates state correctly on mount', () => {
    const mockReceivedFilesCallback = jest.fn()
    const mockSharingCallback = jest.fn()

    ;(handleReceivedFiles as jest.Mock).mockImplementation(callback => {
      mockReceivedFilesCallback()
      const mockCallback = callback as (files: ReceivedFile[]) => void
      mockCallback([{ filePath: 'test-file' }])
    })
    ;(handleSharing as jest.Mock).mockImplementation(callback => {
      mockSharingCallback()
      const mockCallback = callback as (status: SharingIntentStatus) => void
      mockCallback(SharingIntentStatus.OpenedViaSharing)
    })

    const TestComponent = (): JSX.Element => {
      const state = useSharingState()
      return (
        <Text>
          {state.sharingIntentStatus === SharingIntentStatus.OpenedViaSharing
            ? 'OpenedViaSharing'
            : 'NotOpenedViaSharing'}
        </Text>
      )
    }

    const { getByText } = render(
      <SharingProvider>
        <TestComponent />
      </SharingProvider>
    )

    expect(mockReceivedFilesCallback).toHaveBeenCalledTimes(1)
    expect(mockSharingCallback).toHaveBeenCalledTimes(1)

    getByText('OpenedViaSharing')
  })

  it('starts with an undetermined sharing intent status', () => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;(handleReceivedFiles as jest.Mock).mockImplementation(() => {
      /** noop */
    })
    ;(handleSharing as jest.Mock).mockImplementation(() => {
      /** noop */
    })

    const TestComponent = (): JSX.Element => {
      const state = useSharingState()
      return <Text>{state.sharingIntentStatus}</Text>
    }
    const { getByText } = render(
      <SharingProvider>
        <TestComponent />
      </SharingProvider>
    )

    getByText(SharingIntentStatus.Undetermined.toString())
  })

  it('updates to "not opened via sharing" when service indicates', () => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;(handleReceivedFiles as jest.Mock).mockImplementation(callback => {
      const mockCallback = callback as (files: ReceivedFile[]) => void
      mockCallback([])
    })
    ;(handleSharing as jest.Mock).mockImplementation(callback => {
      const mockCallback = callback as (status: SharingIntentStatus) => void
      mockCallback(SharingIntentStatus.NotOpenedViaSharing)
    })

    const TestComponent = (): JSX.Element => {
      const state = useSharingState()
      return <Text>{state.sharingIntentStatus}</Text>
    }

    const { getByText } = render(
      <SharingProvider>
        <TestComponent />
      </SharingProvider>
    )

    getByText(SharingIntentStatus.NotOpenedViaSharing.toString())
  })
})
