import RN from 'react-native'

import {
  checkIsReload,
  checkIsRedirectOutside,
  checkIsSlugSwitch
} from './urlHelpers'

jest.mock('react-native-inappbrowser-reborn', () => ({
  open: jest.fn(),
  close: jest.fn()
}))
jest.mock('react-native-ios11-devicecheck', () => ({
  generateKey: jest.fn(),
  attestKey: jest.fn()
}))

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios'
  }
}))

describe('urlHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkIsReload', () => {
    it(`should detect reload when navigationType is 'reload'`, () => {
      const initialRequest = { navigationType: 'reload' }
      const preventRefreshByDefault = false
      RN.Platform.OS = 'android'

      const result = checkIsReload(initialRequest, preventRefreshByDefault)

      expect(result).toBe(true)
    })

    it(`should not detect reload when navigationType is not 'reload'`, () => {
      const initialRequest = { navigationType: 'other' }
      const preventRefreshByDefault = false
      RN.Platform.OS = 'android'

      const result = checkIsReload(initialRequest, preventRefreshByDefault)

      expect(result).toBe(false)
    })

    describe('when preventRefreshByDefault is true', () => {
      it('should prevent detecting reload on iOS', () => {
        const initialRequest = { navigationType: 'reload' }
        const preventRefreshByDefault = true
        RN.Platform.OS = 'ios'

        const result = checkIsReload(initialRequest, preventRefreshByDefault)

        expect(result).toBe(false)
      })

      it('should be ignored on Android', () => {
        const initialRequest = { navigationType: 'reload' }
        const preventRefreshByDefault = true
        RN.Platform.OS = 'android'

        const result = checkIsReload(initialRequest, preventRefreshByDefault)

        expect(result).toBe(true)
      })
    })
  })

  describe('checkIsRedirectOutside', () => {
    it.each([
      [
        'http://drive.claude.mycozy.cloud',
        'http://drive.claude.mycozy.cloud',
        false
      ],
      [
        'http://drive.claude.mycozy.cloud#hash1',
        'http://drive.claude.mycozy.cloud#hash2',
        false
      ],
      [
        'http://drive.claude.mycozy.cloud/path1',
        'http://drive.claude.mycozy.cloud/path2',
        true
      ],
      [
        'http://drive.claude.mycozy.cloud/path1#hash1',
        'http://drive.claude.mycozy.cloud/path1#hash2',
        false
      ],
      [
        'http://drive.claude.mycozy.cloud',
        'http://note.claude.mycozy.cloud',
        true
      ]
    ])(
      'should compare %p with %p and return isRedirectOutside=%p',
      (currentUrl, destinationUrl, result) => {
        expect(checkIsRedirectOutside({ currentUrl, destinationUrl })).toEqual(
          result
        )
      }
    )
  })

  describe('checkIsSlugSwitch', () => {
    it.each([
      [
        'http://drive.claude.mycozy.cloud',
        'http://drive.claude.mycozy.cloud',
        'nested',
        false
      ],
      [
        'http://drive.claude.mycozy.cloud#hash1',
        'http://drive.claude.mycozy.cloud#hash2',
        'nested',
        false
      ],
      [
        'http://drive.claude.mycozy.cloud/path1',
        'http://drive.claude.mycozy.cloud/path2',
        'nested',
        false
      ],
      [
        'http://drive.claude.mycozy.cloud/path1#hash1',
        'http://drive.claude.mycozy.cloud/path1#hash2',
        'nested',
        false
      ],
      [
        'http://drive.claude.mycozy.cloud',
        'http://notes.claude.mycozy.cloud',
        'nested',
        'notes'
      ],
      [
        'http://drive.claude.mycozy.cloud',
        'http://google.com',
        'nested',
        false
      ],
      [
        'http://claude-drive.mycozy.cloud',
        'http://claude-drive.mycozy.cloud',
        'flat',
        false
      ],
      [
        'http://claude-drive.mycozy.cloud#hash1',
        'http://claude-drive.mycozy.cloud#hash2',
        'flat',
        false
      ],
      [
        'http://claude-drive.mycozy.cloud/path1',
        'http://claude-drive.mycozy.cloud/path2',
        'flat',
        false
      ],
      [
        'http://claude-drive.mycozy.cloud/path1#hash1',
        'http://claude-drive.mycozy.cloud/path1#hash2',
        'flat',
        false
      ],
      [
        'http://claude-drive.mycozy.cloud',
        'http://claude-notes.mycozy.cloud',
        'flat',
        'notes'
      ],
      ['http://claude-drive.mycozy.cloud', 'http://google.com', 'flat', false],
      ['http://claude-drive.mycozy.cloud', 'google.com', 'flat', false]
    ])(
      'should compare %p with %p with %p subdomain and return isSlugSwitch=%p',
      (currentUrl, destinationUrl, subdomainType, result) => {
        expect(
          checkIsSlugSwitch({ currentUrl, destinationUrl, subdomainType })
        ).toEqual(result)
      }
    )
  })
})
