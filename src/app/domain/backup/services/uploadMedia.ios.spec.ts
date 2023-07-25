import { getVideoPathFromLivePhoto } from '/app/domain/backup/services/uploadMedia.ios'

describe('uploadMedia.ios', () => {
  describe('getVideoPathFromLivePhoto', () => {
    it.each([
      ['IMG_001.HEIC', 'IMG_001.MOV'],
      ['FullSizeRender.heic', 'FullSizeRender.mov'],
      ['/Folder/IMG_001.HEIC', '/Folder/IMG_001.MOV'],
      ['/Folder/FullSizeRender.heic', '/Folder/FullSizeRender.mov']
    ])('with %p should return %p', (path, result) => {
      expect(getVideoPathFromLivePhoto(path)).toBe(result)
    })
  })
})
