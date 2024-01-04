import React from 'react'
import { Text } from 'react-native'
import { render, act } from '@testing-library/react-native'

import { ThemeProvider, useHomeTheme } from '/app/theme/ThemeProvider'
import { setHomeTheme } from '/app/theme/themeManager'
import { HomeThemeType } from '/app/theme/models'

type ActFunction = (callback: () => void) => void
const safeAct = act as unknown as ActFunction

// Helper component to test useTheme hook
const TestComponent = (): JSX.Element => {
  const theme = useHomeTheme()
  return <Text testID="theme-text">{theme}</Text>
}

describe('ThemeProvider and useTheme hook', () => {
  // Test if the ThemeProvider provides the current theme value to components using the useTheme hook
  it('should provide the current theme to components using the useTheme hook', async () => {
    // First, set the theme explicitly:
    safeAct(() => {
      setHomeTheme({
        homeTheme: HomeThemeType.Inverted,
        componentId: 'SOME_COMPONENT_ID'
      })
    })

    const { findByText } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Now, expect that the theme should be 'Inverted'
    await findByText(HomeThemeType.Inverted)

    // Change the theme and verify that the component gets updated
    safeAct(() => {
      setHomeTheme({
        homeTheme: HomeThemeType.Normal,
        componentId: 'SOME_COMPONENT_ID'
      })
    })

    // Wait for the theme to update
    await findByText(HomeThemeType.Normal)
  })

  // Test if useTheme throws an error when used outside of a ThemeProvider
  it('should throw an error when useTheme is used outside a ThemeProvider', () => {
    expect(() => render(<TestComponent />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    )
  })
})
