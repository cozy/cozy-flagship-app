import RNFS from 'react-native-fs'

// create a path you want to write to
export const definePaths = () => {
  const slug = 'home'
  const appName = '/cozy-' + slug

  // const correctSourcePath = RNFS.DocumentDirectoryPath
  const iosSourcePath =
    '/Users/recontact/Library/Developer/CoreSimulator/Devices/A4624548-5C2D-4861-82FB-E3351028B1B6/data/Containers/Data/Application/FE3BDCFF-A01E-4C6F-8D55-DEEAA339B4E0/Documents'
  // ios: /Users/recontact/Library/Developer/CoreSimulator/Devices/A4624548-5C2D-4861-82FB-E3351028B1B6/data/Containers/Data/Application/FE3BDCFF-A01E-4C6F-8D55-DEEAA339B4E0/Documents
  // android: /data/user/0/io.cozy.flagship.mobile/files/cozy/cozy-home/build
  return {
    iosPath: iosSourcePath + appName + '/build',
    androidPath: RNFS.DocumentDirectoryPath + appName,
  }
}
