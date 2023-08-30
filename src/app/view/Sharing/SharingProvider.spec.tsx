import { render } from '@testing-library/react-native'
import React from 'react'
import { Text } from 'react-native'

import { useQuery } from 'cozy-client'

import { OsReceiveProvider } from '/app/view/Sharing/SharingProvider'
import { handleReceivedFiles } from '/app/domain/sharing/services/SharingData'
import { handleOsReceive } from '/app/domain/sharing/services/SharingStatus'
import { OsReceiveIntentStatus } from '/app/domain/sharing/models/SharingState'
import { ReceivedFile } from '/app/domain/sharing/models/ReceivedFile'
import { useOsReceiveState } from '/app/view/Sharing/SharingState'
import { getRouteToUpload } from '/app/domain/sharing/services/SharingNetwork'

jest.mock('/app/domain/sharing/services/SharingData')
jest.mock('/app/domain/sharing/services/SharingStatus')
jest.mock('/app/domain/sharing/services/SharingNetwork')
jest.mock('/app/view/Error/ErrorProvider', () => ({
  useError: jest.fn().mockReturnValue({
    handleError: jest.fn()
  })
}))
jest.mock('cozy-client', () => ({
  useClient: jest.fn(),
  useQuery: jest.fn(),
  Q: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnValue({
      all: jest.fn().mockReturnValue([])
    })
  })
}))
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useNavigationState: jest.fn()
}))

describe('SharingProvider', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;(handleReceivedFiles as jest.Mock).mockClear()
    ;(handleOsReceive as jest.Mock).mockClear()
  })

  it('calls services and updates state correctly on mount', () => {
    const mockReceivedFilesCallback = jest.fn()
    const mockSharingCallback = jest.fn()
    ;(useQuery as jest.Mock).mockReturnValue({ data: [] })
    ;(handleReceivedFiles as jest.Mock).mockImplementation(callback => {
      mockReceivedFilesCallback()
      const mockCallback = callback as (files: ReceivedFile[]) => void
      mockCallback([{ filePath: 'test-file' } as ReceivedFile])
    })
    ;(handleOsReceive as jest.Mock).mockImplementation(callback => {
      mockSharingCallback()
      const mockCallback = callback as (status: OsReceiveIntentStatus) => void
      mockCallback(OsReceiveIntentStatus.OpenedViaOsReceive)
    })
    ;(getRouteToUpload as jest.Mock).mockReturnValue({
      result: {
        href: 'test-href',
        slug: 'test-slug'
      }
    })

    const TestComponent = (): JSX.Element => {
      const state = useOsReceiveState()
      return (
        <Text>
          {state.OsReceiveIntentStatus ===
          OsReceiveIntentStatus.OpenedViaOsReceive
            ? 'OpenedViaSharing'
            : 'NotOpenedViaSharing'}
        </Text>
      )
    }

    const { getByText } = render(
      <OsReceiveProvider>
        <TestComponent />
      </OsReceiveProvider>
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
    ;(handleOsReceive as jest.Mock).mockImplementation(() => {
      /** noop */
    })

    const TestComponent = (): JSX.Element => {
      const state = useOsReceiveState()
      return <Text>{state.OsReceiveIntentStatus}</Text>
    }
    const { getByText } = render(
      <OsReceiveProvider>
        <TestComponent />
      </OsReceiveProvider>
    )

    getByText(OsReceiveIntentStatus.Undetermined.toString())
  })

  it('updates to "not opened via sharing" when service indicates', () => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;(handleReceivedFiles as jest.Mock).mockImplementation(callback => {
      const mockCallback = callback as (files: ReceivedFile[]) => void
      mockCallback([])
    })
    ;(handleOsReceive as jest.Mock).mockImplementation(callback => {
      const mockCallback = callback as (status: OsReceiveIntentStatus) => void
      mockCallback(OsReceiveIntentStatus.NotOpenedViaOsReceive)
    })

    const TestComponent = (): JSX.Element => {
      const state = useOsReceiveState()
      return <Text>{state.OsReceiveIntentStatus}</Text>
    }

    const { getByText } = render(
      <OsReceiveProvider>
        <TestComponent />
      </OsReceiveProvider>
    )

    getByText(OsReceiveIntentStatus.NotOpenedViaOsReceive.toString())
  })

  it('calls cleanup functions on unmount', () => {
    const cleanupReceivedFiles = jest.fn()
    const cleanupSharingIntent = jest.fn()

    ;(handleReceivedFiles as jest.Mock).mockReturnValue(cleanupReceivedFiles)
    ;(handleOsReceive as jest.Mock).mockReturnValue(cleanupSharingIntent)

    const { unmount } = render(
      <OsReceiveProvider>
        <Text>Test</Text>
      </OsReceiveProvider>
    )

    unmount()

    expect(cleanupReceivedFiles).toHaveBeenCalledTimes(1)
    expect(cleanupSharingIntent).toHaveBeenCalledTimes(1)
  })
})
