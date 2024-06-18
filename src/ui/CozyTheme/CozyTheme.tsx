import React, { ReactNode, createContext, useContext, useMemo } from 'react'

import log from 'cozy-logger'

import { CozyThemeColors, getColors } from '/ui/colors'

export type CozyThemeVariant = 'normal' | 'inverted'

interface CozyThemeState {
  variant: CozyThemeVariant
}

// We'll consider the context as possibly undefined
// This will allow us to use the runtime hook with a fallback value and correctly type it
export const CozyThemeContext = createContext<CozyThemeState | undefined>({
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

  // Using optional chaining here to avoid a runtime error
  const colors = useMemo<CozyThemeColors>(
    () =>
      getColors({ variant: forcedVariant ? forcedVariant : context?.variant }),
    [forcedVariant, context?.variant]
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
