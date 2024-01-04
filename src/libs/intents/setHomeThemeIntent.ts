import { HomeThemeParams } from '/app/theme/models'
import { setHomeTheme } from '/app/theme/themeManager'

export const setHomeThemeIntent = async (
  homeTheme: HomeThemeParams
): Promise<boolean> => {
  setHomeTheme(homeTheme)

  return Promise.resolve(true)
}
