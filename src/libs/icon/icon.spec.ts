import { changeIcon as RNChangeIcon } from 'react-native-change-icon'

import { changeIcon } from './icon'

jest.mock('react-native-change-icon')

const mockedRNChangeIcon = RNChangeIcon as jest.MockedFunction<
  typeof RNChangeIcon
>

describe('icon', () => {
  it('should change icon if icon allowed', async () => {
    await changeIcon('mespapiers')

    expect(mockedRNChangeIcon).toHaveBeenCalledWith('mespapiers')
  })

  it('should change icon with default icon if icon not allowed', async () => {
    await changeIcon('drive')

    expect(mockedRNChangeIcon).toHaveBeenCalledWith('cozy')
  })

  it('should return icon name and not throw if icon already used error', async () => {
    mockedRNChangeIcon.mockImplementation(() => {
      throw new Error('ICON_ALREADY_USED')
    })

    expect(await changeIcon('mespapiers')).toBe('mespapiers')
  })

  it('should throw if other error', async () => {
    mockedRNChangeIcon.mockImplementation(() => {
      throw new Error('ICON_INVALID')
    })

    await expect(changeIcon('mespapiers')).rejects.toThrow('ICON_INVALID')
  })
})
