export const getPathWithoutExtension = (path: string): string => {
  return path.substring(0, path.lastIndexOf('.'))
}
