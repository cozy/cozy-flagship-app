import RN from 'react-native'

import {openApp} from './openApp'

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Linking: {
    canOpenURL: jest.fn(),
    openURL: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}))

const navigation = {
  navigate: jest.fn(),
}

describe('openApp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('with no app manifest', () => {
    it('should open href', async () => {
      await openApp(navigation, 'https://appurl')

      expect(navigation.navigate).toHaveBeenCalledWith('cozyapp', {
        href: 'https://appurl',
      })
    })
  })

  describe('with app manifest but no mobile info nor slug fallback', () => {
    it('should open href', async () => {
      await openApp(navigation, 'https://appurl', {
        slug: 'some_app_with_no_native_equivalent',
      })

      expect(navigation.navigate).toHaveBeenCalledWith('cozyapp', {
        href: 'https://appurl',
        iconParams: undefined,
        slug: 'some_app_with_no_native_equivalent',
      })
    })
  })

  describe(`with app manifest and mobile info`, () => {
    it('should open native app from manifest info', async () => {
      RN.Linking.canOpenURL.mockResolvedValue(true)

      await openApp(navigation, 'https://appurl', {
        mobile: {
          schema: 'cozypass://',
          id_playstore: 'io.cozy.pass',
          id_appstore: 'cozy-pass/id1502262449',
        },
      })

      expect(RN.Linking.canOpenURL).toHaveBeenCalledWith('cozypass://')
      expect(RN.Linking.openURL).toHaveBeenCalledWith('cozypass://')
    })

    it('should ask to open AppStore on iOS if native app is not installed', async () => {
      RN.Linking.canOpenURL.mockResolvedValue(false)
      RN.Linking.openURL.mockResolvedValue(false)
      RN.Platform.OS = 'ios'

      RN.Alert.alert = jest.fn((title, message, buttons) => {
        buttons[1].onPress()
      })

      await openApp(navigation, 'https://appurl', {
        mobile: {
          schema: 'cozypass://',
          id_playstore: 'io.cozy.pass',
          id_appstore: 'cozy-pass/id1502262449',
        },
      })

      expect(RN.Linking.canOpenURL).toHaveBeenCalledWith('cozypass://')
      expect(RN.Linking.openURL).toHaveBeenCalledWith(
        'itms-apps://apps.apple.com/id/app/cozy-pass/id1502262449?l=id',
      )
    })

    it('should ask to open PlayStore on Android if native app is not installed', async () => {
      RN.Linking.canOpenURL.mockResolvedValue(false)
      RN.Linking.openURL.mockResolvedValue(false)
      RN.Platform.OS = 'android'

      RN.Alert.alert = jest.fn((title, message, buttons) => {
        buttons[1].onPress()
      })

      await openApp(navigation, 'https://appurl', {
        mobile: {
          schema: 'cozypass://',
          id_playstore: 'io.cozy.pass',
          id_appstore: 'cozy-pass/id1502262449',
        },
      })

      expect(RN.Linking.canOpenURL).toHaveBeenCalledWith('cozypass://')
      expect(RN.Linking.openURL).toHaveBeenCalledWith(
        'https://play.google.com/store/apps/details?id=io.cozy.pass',
      )
    })
  })

  describe(`with app manifest and slug with fallback`, () => {
    it('should open native app from fallbacks info', async () => {
      RN.Linking.canOpenURL.mockResolvedValue(true)

      await openApp(navigation, 'https://appurl', {
        slug: 'passwords',
      })

      expect(RN.Linking.canOpenURL).toHaveBeenCalledWith('cozypass://')
      expect(RN.Linking.openURL).toHaveBeenCalledWith('cozypass://')
    })

    it('should ask to open AppStore on iOS if native app is not installed', async () => {
      RN.Linking.canOpenURL.mockResolvedValue(false)
      RN.Linking.openURL.mockResolvedValue(false)
      RN.Platform.OS = 'ios'

      RN.Alert.alert = jest.fn((title, message, buttons) => {
        buttons[1].onPress()
      })

      await openApp(navigation, 'https://appurl', {
        slug: 'passwords',
      })

      expect(RN.Linking.canOpenURL).toHaveBeenCalledWith('cozypass://')
      expect(RN.Linking.openURL).toHaveBeenCalledWith(
        'itms-apps://apps.apple.com/id/app/cozy-pass/id1502262449?l=id',
      )
    })

    it('should ask to open PlayStore on Android if native app is not installed', async () => {
      RN.Linking.canOpenURL.mockResolvedValue(false)
      RN.Linking.openURL.mockResolvedValue(false)
      RN.Platform.OS = 'android'

      RN.Alert.alert = jest.fn((title, message, buttons) => {
        buttons[1].onPress()
      })

      await openApp(navigation, 'https://appurl', {
        slug: 'passwords',
      })

      expect(RN.Linking.canOpenURL).toHaveBeenCalledWith('cozypass://')
      expect(RN.Linking.openURL).toHaveBeenCalledWith(
        'https://play.google.com/store/apps/details?id=io.cozy.pass',
      )
    })
  })

  describe(`with app manifest and mobile info and slug fallback`, () => {
    it('should prioritize mobile info from manifest over fallback', async () => {
      RN.Linking.canOpenURL.mockResolvedValue(true)

      await openApp(navigation, 'https://appurl', {
        slug: 'passwords',
        mobile: {
          schema: 'cozypassoverride://',
          id_playstore: 'io.cozy.pass.override',
          id_appstore: 'cozy-pass-override/id1502262449',
        },
      })

      expect(RN.Linking.canOpenURL).toHaveBeenCalledWith('cozypassoverride://')
      expect(RN.Linking.openURL).toHaveBeenCalledWith('cozypassoverride://')
    })
  })
})
