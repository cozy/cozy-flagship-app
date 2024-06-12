import { Appearance } from 'react-native'

import { CozyThemeVariant } from '/ui/CozyTheme/CozyTheme'
import { palette } from '/ui/palette'

const ALPHA_0_12 = '1F'
const ALPHA_0_16 = '29'
const ALPHA_0_24 = '3D'
const ALPHA_0_32 = '52'
const ALPHA_0_48 = '7A'
const ALPHA_0_64 = 'A3'
const ALPHA_0_90 = 'E5'

// Light colors

const lightNormalColors = {
  // ACTIONS
  actionColorDisabled: palette.Grey['900'] + ALPHA_0_24,
  actionColorDisabledBackground: palette.Grey['900'] + ALPHA_0_12,

  // BORDERS
  borderMainColor: palette.Grey['900'] + ALPHA_0_16,

  // BACKGROUND
  paperBackgroundColor: palette.Common.white,
  defaultBackgroundColor: palette.Grey['100'],

  // PRIMARY
  primaryColor: palette.Primary['600'],
  primaryContrastTextColor: palette.Common.white,

  // ERROR
  errorColor: palette.Error['600'],

  // TEXT
  primaryTextColor: palette.Grey['900'] + ALPHA_0_90,
  secondaryTextColor: palette.Grey['900'] + ALPHA_0_48,

  // FLAGSHIP APP SPECIFIC
  splashScreenBackgroundColor: palette.FlagshipSpecific.splashScreenBackground,
  onboardingBackgroundColor: palette.FlagshipSpecific.onboardingBackground
}

const lightInvertedColors = {
  // ACTIONS
  actionColorDisabled: palette.Common.white + ALPHA_0_32,
  actionColorDisabledBackground: palette.Common.white + ALPHA_0_12,

  // BORDERS
  borderMainColor: palette.Common.white + ALPHA_0_24,

  // BACKGROUND
  paperBackgroundColor: palette.Primary['600'],
  defaultBackgroundColor: palette.Primary['600'],

  // PRIMARY
  primaryColor: palette.Common.white,
  primaryContrastTextColor: palette.Primary['600'],

  // ERROR
  errorColor: palette.Error['200'],

  // TEXT
  primaryTextColor: palette.Common.white,
  secondaryTextColor: palette.Common.white + ALPHA_0_64,

  // FLAGSHIP APP SPECIFIC
  splashScreenBackgroundColor: palette.FlagshipSpecific.splashScreenBackground,
  onboardingBackgroundColor: palette.FlagshipSpecific.onboardingBackground
}

// Dark colors

const darkNormalColors = {
  // ACTIONS
  actionColorDisabled: palette.Common.white + ALPHA_0_32,
  actionColorDisabledBackground: palette.Common.white + ALPHA_0_12,

  // BORDERS
  borderMainColor: palette.Common.white + ALPHA_0_24,

  // BACKGROUND
  paperBackgroundColor: palette.Grey['800'],
  defaultBackgroundColor: palette.Grey.A400,

  // PRIMARY
  primaryColor: palette.Primary['400'],
  primaryContrastTextColor: palette.Grey['900'] + ALPHA_0_90,

  // ERROR
  errorColor: palette.Error['300'],

  // TEXT
  primaryTextColor: palette.Common.white,
  secondaryTextColor: palette.Common.white + ALPHA_0_64,

  // FLAGSHIP APP SPECIFIC
  splashScreenBackgroundColor: palette.FlagshipSpecific.splashScreenBackground,
  onboardingBackgroundColor: palette.FlagshipSpecific.onboardingBackground
}

const darkInvertedColors = {
  // ACTIONS
  actionColorDisabled: palette.Grey['900'] + ALPHA_0_24,
  actionColorDisabledBackground: palette.Grey['900'] + ALPHA_0_12,

  // BORDERS
  borderMainColor: palette.Grey['900'] + ALPHA_0_16,

  // BACKGROUND
  paperBackgroundColor: palette.Primary['400'],
  defaultBackgroundColor: palette.Primary['400'],

  // PRIMARY
  primaryColor: palette.Grey['800'],
  primaryContrastTextColor: palette.Common.white,

  // ERROR
  errorColor: palette.Error['800'],

  // TEXT
  primaryTextColor: palette.Grey['900'] + ALPHA_0_90,
  secondaryTextColor: palette.Grey['900'] + ALPHA_0_48,

  // FLAGSHIP APP SPECIFIC
  splashScreenBackgroundColor: palette.FlagshipSpecific.splashScreenBackground,
  onboardingBackgroundColor: palette.FlagshipSpecific.onboardingBackground
}

export type CozyThemeColors = typeof lightNormalColors

export const getColors = (
  variant: CozyThemeVariant = 'normal'
): CozyThemeColors => {
  const colorScheme = Appearance.getColorScheme()

  if (colorScheme === 'light') {
    return variant === 'normal' ? lightNormalColors : lightInvertedColors
  } else {
    return variant === 'normal' ? darkNormalColors : darkInvertedColors
  }
}
