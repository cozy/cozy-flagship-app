import { flagshipUI, setFlagshipUI } from './setFlagshipUI'
import { changeBarColors } from 'react-native-immersive-bars'
import { Platform } from 'react-native'

jest.mock('react-native-immersive-bars')

const defaultOS = Platform.OS

describe('setFlagshipUI', () => {
  let mockOnChange: () => void
  beforeEach(() => {
    mockOnChange = jest.fn()
  })

  it('should parse topTheme light', async () => {
    flagshipUI.on('change', mockOnChange)

    await setFlagshipUI({
      topTheme: 'light'
    })

    expect(mockOnChange).toHaveBeenNthCalledWith(1, {
      topTheme: 'light-content'
    })
    expect(changeBarColors).not.toHaveBeenCalled()
  })

  it('should parse topTheme dark', async () => {
    flagshipUI.on('change', mockOnChange)

    await setFlagshipUI({
      topTheme: 'dark'
    })

    expect(mockOnChange).toHaveBeenNthCalledWith(1, {
      topTheme: 'dark-content'
    })
    expect(changeBarColors).not.toHaveBeenCalled()
  })

  it('should parse incomplete object', async () => {
    flagshipUI.on('change', mockOnChange)

    await setFlagshipUI({
      topTheme: undefined,
      topBackground: '#fff'
    })

    expect(mockOnChange).toHaveBeenNthCalledWith(1, { topBackground: '#fff' })
    expect(changeBarColors).not.toHaveBeenCalled()
  })

  it('should parse padded values', async () => {
    flagshipUI.on('change', mockOnChange)

    await setFlagshipUI({
      bottomBackground: '    #fff    '
    })

    expect(mockOnChange).toHaveBeenNthCalledWith(1, {
      bottomBackground: '#fff'
    })
    expect(changeBarColors).not.toHaveBeenCalled()
  })

  it('should parse full objects with bottomTheme special case dark, and not call changeBarColors on iOS', async () => {
    flagshipUI.on('change', mockOnChange)

    Platform.OS = 'ios'

    await setFlagshipUI({
      bottomBackground: 'white',
      bottomTheme: 'dark',
      bottomOverlay: 'transparent',
      topBackground: 'white',
      topTheme: 'dark',
      topOverlay: 'transparent'
    })

    expect(mockOnChange).toHaveBeenNthCalledWith(1, {
      bottomBackground: 'white',
      bottomOverlay: 'transparent',
      topBackground: 'white',
      topOverlay: 'transparent',
      topTheme: 'dark-content'
    })

    expect(changeBarColors).not.toHaveBeenCalled()
  })

  it('should emit parse full objects with bottomTheme special case light, and call changeBarColors on Android', async () => {
    flagshipUI.on('change', mockOnChange)

    Platform.OS = 'android'

    await setFlagshipUI({
      bottomBackground: 'white',
      bottomTheme: 'light',
      bottomOverlay: 'transparent',
      topBackground: 'white',
      topTheme: 'dark',
      topOverlay: 'transparent'
    })

    expect(mockOnChange).toHaveBeenNthCalledWith(1, {
      bottomBackground: 'white',
      bottomOverlay: 'transparent',
      topBackground: 'white',
      topOverlay: 'transparent',
      topTheme: 'dark-content'
    })

    expect(changeBarColors).toHaveBeenNthCalledWith(1, true)
  })

  afterAll(() => {
    Platform.OS = defaultOS
  })
})
