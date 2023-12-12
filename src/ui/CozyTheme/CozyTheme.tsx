import React, { ReactNode, createContext, useContext, useMemo } from 'react'

import log from 'cozy-logger'

import { CozyThemeColors, getColors } from '/ui/colors'

export type CozyThemeVariant = 'normal' | 'inverted'

interface CozyThemeState {
  variant: CozyThemeVariant
}

export const CozyThemeContext = createContext<CozyThemeState>({
  variant: 'normal'
})

interface CozyThemeProps {
  variant: CozyThemeVariant
  children: ReactNode
}

export const CozyTheme = ({
  variant,
  children
}: CozyThemeProps): JSX.Element => (
  <CozyThemeContext.Provider value={{ variant }}>
    {children}
  </CozyThemeContext.Provider>
)

interface CozyThemeHook {
  variant: CozyThemeVariant
  colors: CozyThemeColors
}

export const useCozyTheme = (
  forcedVariant: CozyThemeVariant | undefined = undefined
): CozyThemeHook => {
  const context = useContext(CozyThemeContext)

  const colors = useMemo<CozyThemeColors>(
    () => getColors(forcedVariant ? forcedVariant : context.variant),
    [forcedVariant, context.variant]
  )

  if (forcedVariant) {
    return {
      variant: forcedVariant,
      colors
    }
  }

  if (!context) {
    log(
      'error',
      '`CozyThemeContext` is missing. `useCozyTheme()` must be used within a `<CozyTheme>`. `normal` is returned as fallback value.'
    )

    return {
      variant: 'normal',
      colors
    }
  }

  return {
    ...context,
    colors
  }
}
