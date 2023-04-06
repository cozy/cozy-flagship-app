import { changeIcon as RNChangeIcon } from 'react-native-change-icon'

import { DEFAULT_ICON, ALLOWED_ICONS } from './config'

export const changeIcon = async (slug: string): Promise<string> => {
  const iconName = ALLOWED_ICONS.includes(slug) ? slug : DEFAULT_ICON

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
