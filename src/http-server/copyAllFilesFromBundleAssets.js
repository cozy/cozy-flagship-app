import RNFS from 'react-native-fs'

const copyAllFilesFromBundleAssets = async (originPath, destinationPath) => {
  const content = await RNFS.readDirAssets(originPath)
  for (let asset of content) {
    const assetPath = `${destinationPath}/${asset.name}`
    if (asset.isDirectory()) {
      await RNFS.mkdir(assetPath)
      await copyAllFilesFromBundleAssets(asset.path, assetPath)
    } else {
      await RNFS.copyFileAssets(asset.path, assetPath)
    }
  }
}

export const prepareAndroidAssets = async path => {
  await RNFS.mkdir(path)
  await copyAllFilesFromBundleAssets('cozy/cozy-home/build', path)
  // TODO: don't copy when it already exists 🙏
}
