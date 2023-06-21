import { HomeThemeType } from '/app/theme/models'
import { setHomeTheme } from '/app/theme/themeManager'

export const setHomeThemeIntent = async (
  homeTheme: HomeThemeType
): Promise<boolean> => {
  setHomeTheme(homeTheme)

  return Promise.resolve(true)
}
