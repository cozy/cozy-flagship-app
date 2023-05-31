import { changeIcon as RNChangeIcon } from 'react-native-change-icon'

import flag from 'cozy-flags'

import { changeIcon } from './icon'

jest.mock('react-native-change-icon')
jest.mock('cozy-flags')

const mockFlag = flag as jest.MockedFunction<typeof flag>

const mockedRNChangeIcon = RNChangeIcon as jest.MockedFunction<
  typeof RNChangeIcon
>

const ICON_CHANGE_ALLOWED_FLAGS = {
  'flagship.icon.changeAllowed': true,
  'flagship.icon.defaultIcon': 'cozy'
}

const ICON_CHANGE_NOT_ALLOWED_FLAGS = {
  'flagship.icon.changeAllowed': false
}

const ICON_CHANGE_UNDEFINED_FLAGS = {
  'flagship.icon.changeAllowed': false
}

type Flags = Record<string, boolean | string>

describe('icon', () => {
  const mockFlags = (flags: Flags): void => {
    // @ts-expect-error flag is not correctly typed for the moment
    mockFlag.mockImplementation(flagName => {
      return flags[flagName]
    })
  }

  it('should change icon if icon allowed', async () => {
    mockFlags(ICON_CHANGE_ALLOWED_FLAGS)
    await changeIcon('mespapiers')

    expect(mockedRNChangeIcon).toHaveBeenCalledWith('mespapiers')
  })

  it('should change icon with default icon if icon not allowed', async () => {
    mockFlags(ICON_CHANGE_ALLOWED_FLAGS)
    await changeIcon('drive')

    expect(mockedRNChangeIcon).toHaveBeenCalledWith('cozy')
  })

  it('should not throw if icon already used error', async () => {
    mockedRNChangeIcon.mockImplementation(() => {
      throw new Error('ICON_ALREADY_USED')
    })

    await changeIcon('mespapiers')
  })

  it('should throw if other error', async () => {
    mockedRNChangeIcon.mockImplementation(() => {
      throw new Error('ICON_INVALID')
    })

    await expect(changeIcon('mespapiers')).rejects.toThrow('ICON_INVALID')
  })

  it('should not change icon if icon change not allowed', async () => {
    mockFlags(ICON_CHANGE_NOT_ALLOWED_FLAGS)
    await changeIcon('drive')

    expect(mockedRNChangeIcon).not.toHaveBeenCalled()
  })

  it('should not change icon if icon change undefined', async () => {
    mockFlags(ICON_CHANGE_UNDEFINED_FLAGS)
    await changeIcon('drive')

    expect(mockedRNChangeIcon).not.toHaveBeenCalled()
  })
})
