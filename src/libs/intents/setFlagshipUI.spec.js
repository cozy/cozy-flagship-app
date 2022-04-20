import { flagshipUI, setFlagshipUI } from './setFlagshipUI'
import { changeBarColors } from 'react-native-immersive-bars'

jest.mock('react-native-immersive-bars')

describe('setFlagshipUI', () => {
  let mockOnChange
  beforeEach(() => {
    mockOnChange = jest.fn()
  })

  it('should parse topTheme light', () => {
    flagshipUI.on('change', mockOnChange)

    setFlagshipUI({
      topTheme: 'light'
    })

    expect(mockOnChange).toHaveBeenNthCalledWith(1, {
      topTheme: 'light-content'
    })
    expect(changeBarColors).not.toHaveBeenCalled()
  })

  it('should parse topTheme dark', () => {
    flagshipUI.on('change', mockOnChange)

    setFlagshipUI({
      topTheme: 'dark'
    })

    expect(mockOnChange).toHaveBeenNthCalledWith(1, {
      topTheme: 'dark-content'
    })
    expect(changeBarColors).not.toHaveBeenCalled()
  })

  it('should parse incomplete object', () => {
    flagshipUI.on('change', mockOnChange)

    setFlagshipUI({
      topTheme: undefined,
      topBackground: '#fff'
    })

    expect(mockOnChange).toHaveBeenNthCalledWith(1, { topBackground: '#fff' })
    expect(changeBarColors).not.toHaveBeenCalled()
  })

  it('should parse padded values', () => {
    flagshipUI.on('change', mockOnChange)

    setFlagshipUI({
      bottomBackground: '    #fff    '
    })

    expect(mockOnChange).toHaveBeenNthCalledWith(1, {
      bottomBackground: '#fff'
    })
    expect(changeBarColors).not.toHaveBeenCalled()
  })

  it('should parse full objects with bottomTheme special case dark', () => {
    flagshipUI.on('change', mockOnChange)

    setFlagshipUI({
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

    expect(changeBarColors).toHaveBeenNthCalledWith(1, false)
  })

  it('should emit parse full objects with bottomTheme special case light', () => {
    flagshipUI.on('change', mockOnChange)

    setFlagshipUI({
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
})
