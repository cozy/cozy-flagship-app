import { Platform } from 'react-native'
import {
  changeIcon as RNChangeIcon,
  getIcon as RNGetIcon
} from 'react-native-change-icon'

import { getSplashScreenStatus } from '/app/theme/SplashScreenService'
import { toggleIconChangedModal } from '/libs/icon/IconChangedModal'

import { ALLOWED_ICONS } from './config'

const DEFAULT_ICON = 'base'

const normalizeName = (name: string): string => {
  // Our default icon is called 'base' but react-native-change-icon return 'default' if no matching activity is found...
  if (name === 'default') {
    return DEFAULT_ICON
  }

  return name
}

const isSameIcon = (firstIconName: string, secondIconName: string): boolean => {
  return normalizeName(firstIconName) === normalizeName(secondIconName)
}

export const changeIcon = async (slug: string): Promise<void> => {
  // Changing icon and using splash screen do not work well together.
  // If we call hideSplashScreen when iOS native popup "Icon has changed" is displayed,
  // hideSplashScreen hides iOS native popup instead of splash screen. So here we avoid
  // to call changeIcon when splash screen is displayed.
  const status = await getSplashScreenStatus()
  if (status === 'visible') {
    setTimeout(() => {
      void changeIcon(slug)
    }, 1000)

    return
  }

  const iconName = ALLOWED_ICONS.includes(slug) ? slug : DEFAULT_ICON

  const currentIconName = await RNGetIcon()

  if (isSameIcon(iconName, currentIconName)) {
    return
  }

  try {
    const newIconName = await RNChangeIcon(iconName)

    if (Platform.OS === 'android') {
      toggleIconChangedModal(newIconName)
    }

    return
  } catch (e) {
    if (e instanceof Error && e.message === 'ICON_ALREADY_USED') {
      return
    } else {
      throw e
    }
  }
}
