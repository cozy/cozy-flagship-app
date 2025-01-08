import mime from 'mime/lite'

// For RAW pictures created on modern iPhones
mime.define({ 'image/x-adobe-dng': ['dng'] })

export const getMime = (path: string): string | null => {
  return mime.getType(path)
}
