import { Appearance, ColorSchemeName } from 'react-native'

import flag from 'cozy-flags'

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
    return Appearance.getColorScheme()
  }

  // Force light if flag disabled
  return 'light'
}
