import { getColorScheme } from '/app/theme/colorScheme'
import { CozyThemeVariant } from '/ui/CozyTheme/CozyTheme'
import { palette } from '/ui/palette'

// Light colors

const lightNormalColors = {
  // ACTIONS
  actionColorDisabled: 'rgba(29, 46, 85, 0.24)',
  actionColorDisabledBackground: 'rgba(29, 46, 85, 0.12)',

  // BORDERS
  borderMainColor: 'rgba(29, 46, 85, 0.51)',

  // BACKGROUND
  paperBackgroundColor: '#ffffff',
  defaultBackgroundColor: '#f4f4fa',

  // PRIMARY
  primaryColor: '#0066ff',
  primaryContrastTextColor: '#ffffff',

  // ERROR
  errorColor: palette.Error['600'],

  // TEXT
  primaryTextColor: 'rgba(29, 46, 85, 1);',
  secondaryTextColor: 'rgba(29, 46, 85, 0.7)',

  // FLAGSHIP APP SPECIFIC
  splashScreenBackgroundColor: palette.FlagshipSpecific.splashScreenBackground,
  onboardingBackgroundColor: palette.FlagshipSpecific.onboardingBackground
}

const lightInvertedColors = {
  // ACTIONS
  actionColorDisabled: 'rgba(255, 255, 255, 0.32)',
  actionColorDisabledBackground: 'rgba(255, 255, 255, 0.12)',

  // BORDERS
  borderMainColor: 'rgba(255, 255, 255, 0.51)',

  // BACKGROUND
  paperBackgroundColor: '#0066ff',
  defaultBackgroundColor: '#0066ff',

  // PRIMARY
  primaryColor: 'rgba(255, 255, 255, 1)',
  primaryContrastTextColor: '#0066ff',

  // ERROR
  errorColor: '#ffd3d3',

  // TEXT
  primaryTextColor: 'rgba(255, 255, 255, 1)',
  secondaryTextColor: 'rgba(255, 255, 255, 0.70)',

  // FLAGSHIP APP SPECIFIC
  splashScreenBackgroundColor: palette.FlagshipSpecific.splashScreenBackground,
  onboardingBackgroundColor: palette.FlagshipSpecific.onboardingBackground
}

// Dark colors

const darkNormalColors = {
  // ACTIONS
  actionColorDisabled: 'rgba(255, 255, 255, 0.32)',
  actionColorDisabledBackground: 'rgba(255, 255, 255, 0.12)',

  // BORDERS
  borderMainColor: 'rgba(255, 255, 255, 0.51)',

  // BACKGROUND
  paperBackgroundColor: '#3e424a',
  defaultBackgroundColor: '#2c3039',

  // PRIMARY
  primaryColor: '#91d1ff',
  primaryContrastTextColor: 'rgba(29, 46, 85, 0.9)',

  // ERROR
  errorColor: '#ff9b9b',

  // TEXT
  primaryTextColor: 'rgba(255, 255, 255, 1)',
  secondaryTextColor: 'rgba(255, 255, 255, 0.70)',

  // FLAGSHIP APP SPECIFIC
  splashScreenBackgroundColor: palette.FlagshipSpecific.splashScreenBackground,
  onboardingBackgroundColor: palette.FlagshipSpecific.onboardingBackground
}

const darkInvertedColors = {
  // ACTIONS
  actionColorDisabled: 'rgba(29, 46, 85, 0.24)',
  actionColorDisabledBackground: 'rgba(29, 46, 85, 0.12)',

  // BORDERS
  borderMainColor: 'rgba(29, 46, 85, 0.51)',

  // BACKGROUND
  paperBackgroundColor: '#91D1FF',
  defaultBackgroundColor: '#91D1FF',

  // PRIMARY
  primaryColor: '#3e424a',
  primaryContrastTextColor: 'rgba(255, 255, 255, 1)',

  // ERROR
  errorColor: '#771212',

  // TEXT
  primaryTextColor: 'rgba(29, 46, 85, 1)',
  secondaryTextColor: 'rgba(29, 46, 85, 0.70)',

  // FLAGSHIP APP SPECIFIC
  splashScreenBackgroundColor: palette.FlagshipSpecific.splashScreenBackground,
  onboardingBackgroundColor: palette.FlagshipSpecific.onboardingBackground
}

export type CozyThemeColors = typeof lightNormalColors

export interface GetColorsOptions {
  variant?: CozyThemeVariant
}

export const getColors = ({
  variant = 'normal'
}: GetColorsOptions = {}): CozyThemeColors => {
  const colorScheme = getColorScheme()

  if (colorScheme === 'light') {
    return variant === 'normal' ? lightNormalColors : lightInvertedColors
  } else {
    return variant === 'normal' ? darkNormalColors : darkInvertedColors
  }
}
