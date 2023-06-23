import { Platform } from 'react-native'
import {
  changeIcon as RNChangeIcon,
  getIcon as RNGetIcon
} from 'react-native-change-icon'

import flag from 'cozy-flags'

import { getSplashScreenStatus } from '/app/theme/SplashScreenService'
import { toggleIconChangedModal } from '/libs/icon/IconChangedModal'

import { DEFAULT_ICON, ALLOWED_ICONS, DEFAULT_VALUE } from './config'

// Our default icon is called 'cozy' but react-native-change-icon return 'default' if default icon is selected...
const isSameIcon = (firstIconName: string, secondIconName: string): boolean => {
  return (
    firstIconName === secondIconName ||
    (firstIconName === DEFAULT_VALUE && secondIconName === DEFAULT_ICON) ||
    (firstIconName === DEFAULT_ICON && secondIconName === DEFAULT_VALUE)
  )
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

  const changeAllowed = flag('flagship.icon.changeAllowed')
  const defaultIcon =
    (flag('flagship.icon.defaultIcon') as unknown as string) || DEFAULT_ICON

  if (!changeAllowed) {
    return
  }

  const iconName = ALLOWED_ICONS.includes(slug) ? slug : defaultIcon

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
