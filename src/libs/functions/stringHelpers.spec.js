import { escapeSpecialCharacters, replaceAll } from './stringHelpers'

describe('stringHelper', () => {
  describe('escapeSpecialCharacters', () => {
    it('should escape special characters', async () => {
      const result = escapeSpecialCharacters('[.*+?^${}()|[]\\')

      expect(result).toBe('\\[\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\')
    })
  })

  describe('replaceAll', () => {
    it('should replace a character if found', async () => {
      const result = replaceAll('Hello', 'o', 'a')

      expect(result).toBe('Hella')
    })

    it('should replace all characters if multiple are found', async () => {
      const result = replaceAll('Hello', 'l', 'a')

      expect(result).toBe('Heaao')
    })

    it('should not modify the original string', async () => {
      const originalString = 'Hello'
      const result = replaceAll(originalString, 'o', 'a')

      expect(result).toBe('Hella')
      expect(originalString).toBe('Hello')
    })

    it('should handle special characters (antislash)', async () => {
      const result = replaceAll('C:\\foo\\bar', '\\', '/')

      expect(result).toBe('C:/foo/bar')
    })

    it('should handle special characters (some regex random string)', async () => {
      const result = replaceAll('[.*+?^${}()|[]\\', '.*', '_')

      expect(result).toBe('[_+?^${}()|[]\\')
    })
  })
})
