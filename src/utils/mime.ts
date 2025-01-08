import mime from 'mime/lite'

export const getMime = (path: string): string | null => {
  return mime.getType(path)
}
