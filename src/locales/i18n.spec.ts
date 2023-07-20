import i18n from 'i18next'
import { getLocales } from 'react-native-localize'

import { changeLanguage, defaultLanguage } from '/locales/i18n'

const mockGetLocales = getLocales as jest.Mock

jest.mock('react-native-localize', () => ({
  getLocales: jest.fn().mockReturnValue([{ languageCode: 'en' }])
}))

describe('changeLanguage', () => {
  let spyChangeLanguage: jest.SpyInstance

  beforeEach(() => {
    mockGetLocales.mockReset()
    mockGetLocales.mockReturnValue([{ languageCode: 'en' }])
    spyChangeLanguage = jest.spyOn(i18n, 'changeLanguage')
  })

  afterEach(() => {
    spyChangeLanguage.mockRestore()
  })

  it('changes to the selected language if it is supported', async () => {
    const languageCode = 'es'
    await changeLanguage(languageCode)

    expect(spyChangeLanguage).toHaveBeenCalledWith(languageCode)
  })

  it('falls back to the device language if selected language is not supported but device language is supported', async () => {
    const languageCode = 'unsupported'
    const deviceLanguage = 'fr'
    mockGetLocales.mockReturnValue([{ languageCode: deviceLanguage }])

    await changeLanguage(languageCode)

    expect(spyChangeLanguage).toHaveBeenCalledWith(deviceLanguage)
  })

  it('falls back to English if neither the selected language nor the device language is supported', async () => {
    const languageCode = 'unsupported'
    const deviceLanguage = 'unsupported'

    mockGetLocales.mockImplementation(() => [{ languageCode: deviceLanguage }])

    await changeLanguage(languageCode)

    expect(spyChangeLanguage).toHaveBeenCalledWith(defaultLanguage)
  })
})
