import { render } from '@testing-library/react-native'
import React from 'react'
import { Text } from 'react-native'

import { useQuery } from 'cozy-client'

import { OsReceiveProvider } from '/app/view/OsReceive/OsReceiveProvider'
import { handleReceivedFiles } from '/app/domain/osReceive/services/OsReceiveData'
import { ReceivedFile } from '/app/domain/osReceive/models/ReceivedFile'
import { useOsReceiveState } from '/app/view/OsReceive/OsReceiveState'
import { getRouteToUpload } from '/app/domain/osReceive/services/OsReceiveNetwork'

jest.mock('/app/domain/osReceive/services/OsReceiveData')
jest.mock('/app/domain/osReceive/services/OsReceiveNetwork')
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
  createNavigationContainerRef: jest.fn(),
  useNavigation: jest.fn().mockImplementation(() => ({ navigate: jest.fn() })),
  useNavigationState: jest.fn()
}))

describe('OsReceiveProvider', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;(handleReceivedFiles as jest.Mock).mockClear()
  })

  it('calls services and updates state correctly on mount', () => {
    const mockReceivedFilesCallback = jest.fn()
    ;(useQuery as jest.Mock).mockReturnValue({ data: [] })
    ;(handleReceivedFiles as jest.Mock).mockImplementation(callback => {
      mockReceivedFilesCallback()
      const mockCallback = callback as (files: ReceivedFile[]) => void
      mockCallback([{ filePath: 'test-file' } as ReceivedFile])
    })
    ;(getRouteToUpload as jest.Mock).mockReturnValue({
      result: {
        href: 'test-href',
        slug: 'test-slug'
      }
    })

    const TestComponent = (): JSX.Element => {
      const state = useOsReceiveState()
      return <Text>{JSON.stringify(state)}</Text>
    }

    const { getByText } = render(
      <OsReceiveProvider>
        <TestComponent />
      </OsReceiveProvider>
    )

    expect(mockReceivedFilesCallback).toHaveBeenCalledTimes(1)

    getByText(
      '{"filesToUpload":[{"filePath":"test-file"}],"routeToUpload":{"href":"test-href","slug":"test-slug"},"errored":false,"fileUploaded":null,"fileFailed":null}'
    )
  })

  it('calls cleanup functions on unmount', () => {
    const cleanupReceivedFiles = jest.fn()

    ;(handleReceivedFiles as jest.Mock).mockReturnValue(cleanupReceivedFiles)

    const { unmount } = render(
      <OsReceiveProvider>
        <Text>Test</Text>
      </OsReceiveProvider>
    )

    unmount()

    expect(cleanupReceivedFiles).toHaveBeenCalledTimes(1)
  })
})
