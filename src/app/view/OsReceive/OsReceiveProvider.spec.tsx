import { render } from '@testing-library/react-native'
import React from 'react'
import { Text } from 'react-native'

import { OsReceiveProvider } from '/app/view/OsReceive/OsReceiveProvider'
import { useOsReceiveState } from '/app/view/OsReceive/OsReceiveState'

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
  it('calls services and updates state correctly on mount', () => {
    const TestComponent = (): JSX.Element => {
      const state = useOsReceiveState()
      return <Text>{JSON.stringify(state)}</Text>
    }

    render(
      <OsReceiveProvider>
        <TestComponent />
      </OsReceiveProvider>
    )
  })
})
