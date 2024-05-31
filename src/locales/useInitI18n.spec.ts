/* eslint-disable @typescript-eslint/unbound-method */
import { renderHook } from '@testing-library/react-native'

import CozyClient from 'cozy-client'

import { changeLanguage, getClientLang } from '/locales/i18n'
import { useInitI18n } from '/locales/useInitI18n'

const mockGetClientLang = getClientLang as jest.Mock
const mockChangeLanguage = changeLanguage as jest.Mock

jest.mock('cozy-client')
jest.mock('/locales/i18n', () => ({
  changeLanguage: jest.fn(),
  getClientLang: jest.fn()
}))

describe('useInitI18n', () => {
  let client: CozyClient

  beforeEach(() => {
    client = new CozyClient()
    mockGetClientLang.mockReturnValue('en')
    mockChangeLanguage.mockClear()
    client.on = jest.fn()
    client.removeListener = jest.fn()
  })

  it('adds and removes event listener', () => {
    const { unmount } = renderHook(() => useInitI18n(client))

    expect(client.on).toHaveBeenCalledWith('login', expect.any(Function))

    unmount()

    expect(client.removeListener).toHaveBeenCalledWith(
      'login',
      expect.any(Function)
    )
  })

  it('calls changeLanguage if client is logged', () => {
    client.isLogged = true

    const { unmount } = renderHook(() => useInitI18n(client))

    expect(changeLanguage).toHaveBeenCalledWith('en')

    unmount()
  })

  it('calls changeLanguage on client login event', () => {
    const { unmount } = renderHook(() => useInitI18n(client))

    // simulate login event
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const onLoginCallback = (client.on as jest.Mock).mock
      .calls[0][1] as () => void
    onLoginCallback()

    expect(changeLanguage).toHaveBeenCalledWith('en')

    unmount()
  })
})
