import { isSameMedia } from '/app/domain/backup/helpers'

describe('media helper', () => {
  describe('isSameMedia', () => {
    it('should not consider photo and video part of Live Photo as same media', () => {
      const livePhotoPhotoPartMedia = {
        name: 'IMG_0744.MOV',
        uri: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
        creationDate: 1682604478000,
        modificationDate: 1688756699000,
        remoteId: 'c3843c5245f8a47c56a185d13f1c1f51',
        md5: 'syHJFPEfgvfDCJ+6V+BqFg=='
      }

      const livePhotoVideoPartMedia = {
        name: 'IMG_0744.HEIC',
        uri: 'ph://5FD84686-207F-40F1-BCE8-3A837275B0E3/L0/001',
        creationDate: 1682604478000,
        modificationDate: 1688756699000,
        remoteId: 'c3843c5245f8a47c56a185d13f1c20b5',
        md5: 'EEkGai+FsC0KEp6CZZElag=='
      }

      expect(
        isSameMedia(livePhotoPhotoPartMedia, livePhotoVideoPartMedia)
      ).toBe(false)
    })
  })
})
