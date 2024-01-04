import { CozyThemeVariant } from '/ui/CozyTheme/CozyTheme'
import { palette } from '/ui/palette'

const ALPHA_0_12 = '1F'
const ALPHA_0_16 = '29'
const ALPHA_0_24 = '3D'
const ALPHA_0_32 = '52'
const ALPHA_0_48 = '7A'
const ALPHA_0_64 = 'A3'
const ALPHA_0_90 = 'E5'

const colors = {
  // ACTIONS
  actionColorDisabled: palette.Grey['900'] + ALPHA_0_24,
  actionColorDisabledBackground: palette.Grey['900'] + ALPHA_0_12,

  // BORDERS
  borderMainColor: palette.Grey['900'] + ALPHA_0_16,

  // BACKGROUND
  paperBackgroundColor: palette.Common.white,

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

const colorsInverted = {
  // ACTIONS
  actionColorDisabled: palette.Common.white + ALPHA_0_32,
  actionColorDisabledBackground: palette.Common.white + ALPHA_0_12,

  // BORDERS
  borderMainColor: palette.Common.white + ALPHA_0_24,

  // BACKGROUND
  paperBackgroundColor: palette.Primary['600'],

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

export type CozyThemeColors = typeof colors

export const getColors = (
  variant: CozyThemeVariant = 'normal'
): CozyThemeColors => {
  return variant === 'normal' ? colors : colorsInverted
}
