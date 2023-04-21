import {
  changeIcon as RNChangeIcon,
  getIcon as RNGetIcon
} from 'react-native-change-icon'

import { DEFAULT_ICON, ALLOWED_ICONS, DEFAULT_VALUE } from './config'

// Our default icon is called 'cozy' but react-native-change-icon return 'default' if default icon is selected...
const isSameIcon = (firstIconName: string, secondIconName: string): boolean => {
  return (
    firstIconName === secondIconName ||
    (firstIconName === DEFAULT_VALUE && secondIconName === DEFAULT_ICON) ||
    (firstIconName === DEFAULT_ICON && secondIconName === DEFAULT_VALUE)
  )
}

export const changeIcon = async (slug: string): Promise<string> => {
  const iconName = ALLOWED_ICONS.includes(slug) ? slug : DEFAULT_ICON

  const currentIconName = await RNGetIcon()

  if (isSameIcon(iconName, currentIconName)) {
    return iconName
  }

  try {
    return await RNChangeIcon(iconName)
  } catch (e) {
    if (e instanceof Error && e.message === 'ICON_ALREADY_USED') {
      return iconName
    } else {
      throw e
    }
  }
}
