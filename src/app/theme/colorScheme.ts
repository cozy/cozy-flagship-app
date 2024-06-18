import { Appearance, ColorSchemeName } from 'react-native'

import flag from 'cozy-flags'

export const getColorScheme = (): ColorSchemeName => {
  if (flag('ui.darkmode.enabled')) {
    return Appearance.getColorScheme()
  }

  // Force light if flag disabled
  return 'light'
}
