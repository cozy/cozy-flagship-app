export const getPathExtension = (path: string): string => {
  return path.substring(path.lastIndexOf('.') + 1)
}

export const getPathWithoutExtension = (path: string): string => {
  return path.substring(0, path.lastIndexOf('.'))
}

export const getPathWithoutFilename = (path: string): string => {
  return path.substring(0, path.lastIndexOf('/'))
}
