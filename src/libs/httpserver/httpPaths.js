import RNFS from 'react-native-fs'

/**
 * Define iOS path and android path used by http server as root folder
 *
 * @returns {string}
 */
export const getServerBaseFolder = () => {
  return RNFS.DocumentDirectoryPath
}
