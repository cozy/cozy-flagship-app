import MicroEE from 'microee'
import React from 'react'
import { AppState } from 'react-native'
import { render } from '@testing-library/react-native'

import { useCookieResyncOnResume } from './useCookieResyncOnResume'

import { resyncCookies } from '/libs/httpserver/httpCookieManager'

jest.mock('/libs/httpserver/httpCookieManager', () => ({
  resyncCookies: jest.fn()
}))

let mockIsLogged = true
jest.mock('cozy-client', () => ({
  useClient: jest.fn().mockImplementation(() => ({
    isLogged: mockIsLogged
  }))
}))

function AppStateMock() {}
MicroEE.mixin(AppStateMock)
const mockAppState = new AppStateMock()
jest.mock('react-native/Libraries/AppState/AppState', () => ({
  currentState: '',
  addEventListener: jest.fn().mockImplementation((name, fn) => {
    mockAppState.on(name, fn)

    return () => mockAppState.removeListener(name, fn)
  })
}))

const FakeApp = () => {
  useCookieResyncOnResume()

  return <div>Hello</div>
}

describe('useCookieResyncOnResume', () => {
  it('should resync cookies when going from background to active', () => {
    render(<FakeApp />)
    mockAppState.emit('change', 'background') // initial state

    resyncCookies.mockResolvedValue({})
    mockAppState.emit('change', 'active')

    expect(AppState.addEventListener).toHaveBeenCalledTimes(1)
    expect(resyncCookies).toHaveBeenCalled()
  })

  it('should not resync cookies when going from inactive to active', () => {
    render(<FakeApp />)
    mockAppState.emit('change', 'inactive') // initial state

    resyncCookies.mockResolvedValue({})
    mockAppState.emit('change', 'active')

    expect(AppState.addEventListener).toHaveBeenCalledTimes(1)
    expect(resyncCookies).not.toHaveBeenCalled()
  })

  it('should not resync cookies when going from active to background', () => {
    render(<FakeApp />)
    mockAppState.emit('change', 'active') // initial state

    resyncCookies.mockResolvedValue({})
    mockAppState.emit('change', 'background')

    expect(AppState.addEventListener).toHaveBeenCalledTimes(1)
    expect(resyncCookies).not.toHaveBeenCalled()
  })

  it('should not resync cookies when going from background to active but client is logged out', () => {
    mockIsLogged = false
    render(<FakeApp />)
    mockAppState.emit('change', 'background') // initial state

    resyncCookies.mockResolvedValue({})
    mockAppState.emit('change', 'active')

    expect(AppState.addEventListener).toHaveBeenCalledTimes(1)
    expect(resyncCookies).not.toHaveBeenCalled()
  })
})
