import { StatusBar } from 'react-native'

import { setStatusBarColorToMatchBackground } from '/screens/login/components/functions/clouderyBackgroundFetcher'
import { getColors } from '/ui/colors'

jest.spyOn(StatusBar, 'setBarStyle')

const colors = getColors()

describe('clouderyBackgroundFetcher', () => {
  describe('pickLighOrDarkBasedOnBackgroundColor', () => {
    it(`should return light color for Cozy primaryColor (blue)`, () => {
      setStatusBarColorToMatchBackground(colors.primaryColor)

      expect(StatusBar.setBarStyle).toHaveBeenCalledWith('light-content')
    })

    it(`should return dark color for Cozy paperBackgroundColor`, () => {
      setStatusBarColorToMatchBackground(colors.paperBackgroundColor)

      expect(StatusBar.setBarStyle).toHaveBeenCalledWith('dark-content')
    })

    it(`should return dark color for DarkGray background`, () => {
      setStatusBarColorToMatchBackground('#4b4b4b')

      expect(StatusBar.setBarStyle).toHaveBeenCalledWith('light-content')
    })

    it(`should handle 3 digit regex format`, () => {
      setStatusBarColorToMatchBackground('#FFF')

      expect(StatusBar.setBarStyle).toHaveBeenCalledWith('dark-content')
    })

    it(`should not throw if color has bad format`, () => {
      setStatusBarColorToMatchBackground('WRONG_FORMAT')

      expect(StatusBar.setBarStyle).not.toHaveBeenCalled()
    })

    it(`should not throw if color is empty string`, () => {
      setStatusBarColorToMatchBackground('')

      expect(StatusBar.setBarStyle).not.toHaveBeenCalled()
    })
  })
})
