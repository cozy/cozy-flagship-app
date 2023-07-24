import {
  getPathWithoutExtension,
  getPathWithoutFilename
} from '/app/domain/backup/helpers'

describe('file helper', () => {
  describe('getPathWithoutExtension', () => {
    it.each([
      ['IMG_001.heic', 'IMG_001'],
      ['/Folder/IMG_001.heic', '/Folder/IMG_001'],
      ['IMG_001.heic.mov', 'IMG_001.heic']
    ])('with %p should return %p', (path, result) => {
      expect(getPathWithoutExtension(path)).toBe(result)
    })
  })

  describe('getPathWithoutFilename', () => {
    it.each([
      ['IMG_001.heic', ''],
      ['/Folder/IMG_001.heic', '/Folder'],
      ['/Folder/Directory/IMG_001.heic', '/Folder/Directory']
    ])('with %p should return %p', (path, result) => {
      expect(getPathWithoutFilename(path)).toBe(result)
    })
  })
})
