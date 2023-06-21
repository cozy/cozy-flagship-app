import React, { createContext, useContext, useEffect, useState } from 'react'

import { HomeThemeType } from '/app/theme/models'
import {
  getHomeTheme,
  addHomeThemeChangeListener,
  removeHomeThemeChangeListener
} from '/app/theme/themeManager'

const ThemeContext = createContext<HomeThemeType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider = ({
  children
}: ThemeProviderProps): JSX.Element => {
  const [homeTheme, setHomeThemeState] = useState(getHomeTheme())

  useEffect(() => {
    const handleHomeThemeChange = (newHomeTheme: HomeThemeType): void => {
      setHomeThemeState(newHomeTheme)
    }

    addHomeThemeChangeListener(handleHomeThemeChange)

    return () => {
      removeHomeThemeChangeListener(handleHomeThemeChange)
    }
  }, [])

  return (
    <ThemeContext.Provider value={homeTheme}>{children}</ThemeContext.Provider>
  )
}

export const useHomeTheme = (): HomeThemeType => {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
