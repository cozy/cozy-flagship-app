import { Platform } from 'react-native'
import { getVisibilityStatus } from 'react-native-bootsplash'
import {
  changeIcon as RNChangeIcon,
  getIcon as RNGetIcon
} from 'react-native-change-icon'

import { changeIcon } from '/libs/icon/icon'
import * as constants from '/libs/icon/config'
import { toggleIconChangedModal } from '/libs/icon/IconChangedModal'

jest.mock('react-native-change-icon')
jest.mock('/libs/icon/IconChangedModal')

const mockGetVisibilityStatus = getVisibilityStatus as jest.MockedFunction<
  typeof getVisibilityStatus
>

const mockRNGetIcon = RNGetIcon as jest.MockedFunction<typeof RNGetIcon>

const mockedRNChangeIcon = RNChangeIcon as jest.MockedFunction<
  typeof RNChangeIcon
>

describe('icon', () => {
  beforeEach(() => {
    constants.ALLOWED_ICONS.length = 0
    Platform.OS = 'ios'
    mockedRNChangeIcon.mockReset()
    mockGetVisibilityStatus.mockResolvedValue('hidden')
    mockRNGetIcon.mockResolvedValue('')
  })

  it('should change icon if icon allowed', async () => {
    constants.ALLOWED_ICONS.push('mespapiers')
    await changeIcon('mespapiers')

    expect(mockedRNChangeIcon).toHaveBeenCalledWith('mespapiers')
  })

  it('should change icon with default icon if icon not allowed', async () => {
    await changeIcon('drive')

    expect(mockedRNChangeIcon).toHaveBeenCalledWith('base')
  })

  it('should not change icon if same icon is already set', async () => {
    mockRNGetIcon.mockResolvedValue('mespapiers')
    constants.ALLOWED_ICONS.push('mespapiers')
    await changeIcon('mespapiers')

    expect(mockedRNChangeIcon).not.toHaveBeenCalled()
  })

  it('should not change icon for base if default is returned by react-native-change-icon', async () => {
    mockRNGetIcon.mockResolvedValue('default')
    await changeIcon('base')

    expect(mockedRNChangeIcon).not.toHaveBeenCalled()
  })

  it('should not throw if icon already used error', async () => {
    constants.ALLOWED_ICONS.push('mespapiers')
    mockedRNChangeIcon.mockImplementation(() => {
      throw new Error('ICON_ALREADY_USED')
    })

    await changeIcon('mespapiers')
  })

  it('should throw if other error', async () => {
    constants.ALLOWED_ICONS.push('mespapiers')
    mockedRNChangeIcon.mockImplementation(() => {
      throw new Error('ICON_INVALID')
    })

    await expect(changeIcon('mespapiers')).rejects.toThrow('ICON_INVALID')
  })

  it('should not show changed modal on iOS because it is already handled by the OS', async () => {
    constants.ALLOWED_ICONS.push('mespapiers')
    await changeIcon('mespapiers')

    expect(mockedRNChangeIcon).toHaveBeenCalledWith('mespapiers')
    expect(toggleIconChangedModal).not.toHaveBeenCalled()
  })

  it('should not show changed modal on iOS because it is already handled by the OS', async () => {
    Platform.OS = 'android'
    constants.ALLOWED_ICONS.push('mespapiers')
    mockedRNChangeIcon.mockResolvedValueOnce('mespapiers')
    await changeIcon('mespapiers')

    expect(mockedRNChangeIcon).toHaveBeenCalledWith('mespapiers')
    expect(toggleIconChangedModal).toHaveBeenCalledWith('mespapiers')
  })
})
