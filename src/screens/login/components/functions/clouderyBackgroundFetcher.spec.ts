import { StatusBar } from 'react-native'

import { setStatusBarColorToMatchBackground } from '/screens/login/components/functions/clouderyBackgroundFetcher'
import { getColors } from '/ui/colors'

jest.spyOn(StatusBar, 'setBarStyle')

const colors = getColors()

describe('clouderyBackgroundFetcher', () => {
  describe('pickLighOrDarkBasedOnBackgroundColor', () => {
    it(`should return light color for Cozy primaryColor (blue)`, () => {
      setStatusBarColorToMatchBackground(colors.primaryColor)

      expect(StatusBar.setBarStyle).toHaveBeenLastCalledWith('light-content')
    })

    it(`should return dark color for Cozy paperBackgroundColor`, () => {
      setStatusBarColorToMatchBackground(colors.paperBackgroundColor)

      expect(StatusBar.setBarStyle).toHaveBeenLastCalledWith('dark-content')
    })

    it(`should return dark color for DarkGray background`, () => {
      setStatusBarColorToMatchBackground('#4b4b4b')

      expect(StatusBar.setBarStyle).toHaveBeenLastCalledWith('light-content')
    })
  })
})
