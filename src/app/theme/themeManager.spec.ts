import {
  getHomeTheme,
  setHomeTheme,
  addHomeThemeChangeListener,
  removeHomeThemeChangeListener
} from '/app/theme/themeManager'
import { HomeThemeType } from '/app/theme/models'

describe('themeManager', () => {
  // Test if the initial theme is Inverted
  test('should have an initial theme of Inverted', () => {
    expect(getHomeTheme()).toBe(HomeThemeType.Inverted)
  })

  // Test if the setHomeTheme function updates the theme
  test('should update the theme when setHomeTheme is called', () => {
    setHomeTheme({
      homeTheme: HomeThemeType.Normal,
      componentId: 'SOME_COMPONENT_ID'
    })

    expect(getHomeTheme()).toBe(HomeThemeType.Normal)
  })

  // Test if addThemeChangeListener registers a function that gets called when the theme changes
  test('should call the listener when the theme changes', () => {
    const mockListener = jest.fn()
    addHomeThemeChangeListener(mockListener)

    // Change the theme
    setHomeTheme({
      homeTheme: HomeThemeType.Inverted,
      componentId: 'SOME_COMPONENT_ID'
    })

    // Expect the listener to have been called
    expect(mockListener).toHaveBeenCalledWith(HomeThemeType.Inverted)
  })

  // Test if removeThemeChangeListener unregisters a previously registered listener
  test('should not call the listener once it has been removed', () => {
    const mockListener = jest.fn()
    addHomeThemeChangeListener(mockListener)

    // Remove the listener
    removeHomeThemeChangeListener(mockListener)

    // Change the theme
    setHomeTheme({
      homeTheme: HomeThemeType.Normal,
      componentId: 'SOME_COMPONENT_ID'
    })

    // Expect the listener not to have been called
    expect(mockListener).not.toHaveBeenCalled()
  })
})
