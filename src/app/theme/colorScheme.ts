import { useEffect } from 'react'
import { Appearance, ColorSchemeName } from 'react-native'

import { useSettings } from 'cozy-client'

export const setColorScheme = (
  colorScheme: ColorSchemeName | string | undefined
): void => {
  const formattedColorScheme = formatColorSchemeName(colorScheme)
  Appearance.setColorScheme(formattedColorScheme)
}

export const getColorScheme = (): ColorSchemeName => {
  return Appearance.getColorScheme()
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
  const { values } = useSettings('instance', ['colorScheme']) as {
    values: Record<'colorScheme', string | undefined> | undefined
  }

  const instanceColorScheme = values?.colorScheme

  useEffect(() => {
    setColorScheme(instanceColorScheme)
  }, [instanceColorScheme])
}
