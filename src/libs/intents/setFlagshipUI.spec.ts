import { Platform } from 'react-native'
import { changeBarColors } from 'react-native-immersive-bars'

import Minilog from 'cozy-minilog'

import {
  applyFlagshipUI,
  cleanTheme,
  setFlagshipUI
} from '/libs/intents/setFlagshipUI'
import { flagshipUIEventHandler } from '/app/view/FlagshipUI'

jest.mock('react-native-immersive-bars')
jest.mock('/app/view/FlagshipUI')

jest.mock('cozy-minilog', () => {
  const mockLogFunctions = {
    debug: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }

  return {
    __esModule: true,
    default: (): MiniLogger => mockLogFunctions
  }
})

const defaultOS = Platform.OS

describe('cleanTheme', () => {
  it('should parse topTheme light', () => {
    const result = cleanTheme({
      topTheme: 'light'
    })

    expect(result).toStrictEqual({
      topTheme: 'light-content'
    })
  })

  it('should parse topTheme dark', () => {
    const result = cleanTheme({
      topTheme: 'dark'
    })

    expect(result).toStrictEqual({
      topTheme: 'dark-content'
    })
  })

  it('should parse incomplete object', () => {
    const result = cleanTheme({
      topTheme: undefined,
      topBackground: '#fff'
    })

    expect(result).toStrictEqual({ topBackground: '#fff' })
  })

  it('should parse padded values', () => {
    const result = cleanTheme({
      bottomBackground: '    #fff    '
    })

    expect(result).toStrictEqual({
      bottomBackground: '#fff'
    })
  })

  it('should emit parse full objects with bottomTheme special case light', () => {
    const result = cleanTheme({
      bottomBackground: 'white',
      bottomTheme: 'light',
      bottomOverlay: 'transparent',
      topBackground: 'white',
      topTheme: 'dark',
      topOverlay: 'transparent'
    })

    expect(result).toStrictEqual({
      bottomBackground: 'white',
      bottomOverlay: 'transparent',
      bottomTheme: 'light-content',
      topBackground: 'white',
      topOverlay: 'transparent',
      topTheme: 'dark-content'
    })
  })

  it('should parse full objects with bottomTheme special case dark', () => {
    const result = cleanTheme({
      bottomBackground: 'white',
      bottomTheme: 'dark',
      bottomOverlay: 'transparent',
      topBackground: 'white',
      topTheme: 'dark',
      topOverlay: 'transparent'
    })

    expect(result).toStrictEqual({
      bottomBackground: 'white',
      bottomOverlay: 'transparent',
      bottomTheme: 'dark-content',
      topBackground: 'white',
      topOverlay: 'transparent',
      topTheme: 'dark-content'
    })
  })
})

describe('applyFlagshipUI', () => {
  it('should not call changeBarColors on iOS', () => {
    Platform.OS = 'ios'

    applyFlagshipUI({
      bottomBackground: 'white',
      bottomTheme: 'dark',
      bottomOverlay: 'transparent',
      topBackground: 'white',
      topTheme: 'dark',
      topOverlay: 'transparent'
    })

    expect(changeBarColors).not.toHaveBeenCalled()
  })

  it('should call changeBarColors on Android', () => {
    Platform.OS = 'android'

    applyFlagshipUI({
      bottomBackground: 'white',
      bottomTheme: 'light',
      bottomOverlay: 'transparent',
      topBackground: 'white',
      topTheme: 'dark',
      topOverlay: 'transparent'
    })

    expect(changeBarColors).toHaveBeenNthCalledWith(1, true)
  })

  afterAll(() => {
    Platform.OS = defaultOS
  })
})

describe('setFlagshipUI', () => {
  it('should redirect to the new FlagshipUIService API (when called from cozy-apps)', async () => {
    await setFlagshipUI({
      topTheme: 'light',
      componentId: 'SOME_COMPONENT_ID'
    })

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(flagshipUIEventHandler.emit).toHaveBeenCalledWith(
      'SET_COMPONENT_COLORS',
      'SOME_COMPONENT_ID',
      { topTheme: 'light' }
    )
  })

  it('should log error when called without componentId to warn sentry when old API is still called', async () => {
    const mockLog = Minilog('test')

    await setFlagshipUI({
      topTheme: 'light'
    })

    expect(mockLog.error).toHaveBeenCalledWith(
      "SetFlagshipUI shouldn't be called without componentId, this means that the old setFlagshipUI architecture has not been migrated completly"
    )
  })
})
