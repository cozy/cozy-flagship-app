import {
  escapeSpecialCharacters,
  normalizeFqdn,
  replaceAll
} from './stringHelpers'

describe('stringHelper', () => {
  describe('escapeSpecialCharacters', () => {
    it('should escape special characters', () => {
      const result = escapeSpecialCharacters('[.*+?^${}()|[]\\')

      expect(result).toBe('\\[\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\')
    })
  })

  describe('replaceAll', () => {
    it('should replace a character if found', () => {
      const result = replaceAll('Hello', 'o', 'a')

      expect(result).toBe('Hella')
    })

    it('should replace all characters if multiple are found', () => {
      const result = replaceAll('Hello', 'l', 'a')

      expect(result).toBe('Heaao')
    })

    it('should not modify the original string', () => {
      const originalString = 'Hello'
      const result = replaceAll(originalString, 'o', 'a')

      expect(result).toBe('Hella')
      expect(originalString).toBe('Hello')
    })

    it('should handle special characters (antislash)', () => {
      const result = replaceAll('C:\\foo\\bar', '\\', '/')

      expect(result).toBe('C:/foo/bar')
    })

    it('should handle special characters (some regex random string)', () => {
      const result = replaceAll('[.*+?^${}()|[]\\', '.*', '_')

      expect(result).toBe('[_+?^${}()|[]\\')
    })
  })

  describe('normalizeFqdn', () => {
    it(`should replace all ':' by '_'`, () => {
      const result = normalizeFqdn('cozy.tools:8080')

      expect(result).toBe('cozy.tools_8080')
    })
  })
})
