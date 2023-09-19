import { Media, BackupedMedia } from '/app/domain/backup/models'

export const isSameMedia = (
  a: Media | BackupedMedia,
  b: Media | BackupedMedia
): boolean => {
  return (
    a.name === b.name &&
    a.creationDate === b.creationDate &&
    a.modificationDate === b.modificationDate
  )
}
