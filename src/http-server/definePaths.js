import RNFS from 'react-native-fs'

/**
 * Define iOS path and android path used by http server
 * @returns {{iosPath: string, androidPath: string}}
 */
export const definePaths = () => {
  const slug = 'home'
  const appName = '/cozy-' + slug
  return RNFS.DocumentDirectoryPath + appName
}
