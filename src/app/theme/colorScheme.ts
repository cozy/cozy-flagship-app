import { useEffect } from 'react'
import { Appearance, ColorSchemeName } from 'react-native'

import { useSettings } from 'cozy-client'
import flag from 'cozy-flags'

interface GetColorSchemeOptions {
  useUserColorScheme?: boolean
}

export const setColorScheme = (
  colorScheme: ColorSchemeName | string | undefined
): void => {
  const formattedColorScheme = formatColorSchemeName(colorScheme)
  Appearance.setColorScheme(formattedColorScheme)
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

const formatColorSchemeName = (
  colorScheme: ColorSchemeName | string | undefined
): ColorSchemeName => {
  switch (colorScheme) {
    case 'light':
      return 'light'
    case 'dark':
      return 'dark'
    default:
      return null
  }
}

export const useColorScheme = (): void => {
  const {
    values: { colorScheme: instanceColorScheme }
  } = useSettings('instance', ['colorScheme']) as {
    values: Record<'colorScheme', string | undefined>
  }

  useEffect(() => {
    setColorScheme(instanceColorScheme)
  }, [instanceColorScheme])
}
