import { Media, BackupedMedia } from '/app/domain/backup/models'

export const isSameMedia = (
  a: Media | BackupedMedia,
  b: Media | BackupedMedia
): boolean => {
  return a.uri === b.uri
}
