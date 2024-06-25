import { Appearance, ColorSchemeName } from 'react-native'

import flag from 'cozy-flags'

let storedColorScheme: string | undefined = undefined

export const setStoredColorScheme = (newColorScheme: string): void => {
  storedColorScheme = newColorScheme
}

export const getStoredColorScheme = (): string | undefined => {
  return storedColorScheme
}
interface GetColorSchemeOptions {
  useUserColorScheme?: boolean
}

export const getColorScheme = ({
  useUserColorScheme = false
}: GetColorSchemeOptions = {}): ColorSchemeName => {
  if (!useUserColorScheme) {
    return Appearance.getColorScheme()
  }

  if (flag('ui.darkmode.enabled')) {
    if (storedColorScheme === 'auto') {
      return Appearance.getColorScheme()
    }

    return storedColorScheme as ColorSchemeName
  }

  // Force light if flag disabled
  return 'light'
}
