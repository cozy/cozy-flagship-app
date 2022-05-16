import RNFS from 'react-native-fs'
import { Platform } from 'react-native'
import Minilog from '@cozy/minilog'

const log = Minilog('BundleAssets')

const copyAllFilesFromAndroidBundleAssets = async (
  originPath,
  destinationPath
) => {
  const content = await RNFS.readDirAssets(originPath)
  for (let asset of content) {
    const assetPath = `${destinationPath}/${asset.name}`
    if (asset.isDirectory()) {
      await RNFS.mkdir(assetPath)
      await copyAllFilesFromAndroidBundleAssets(asset.path, assetPath)
    } else {
      log.debug(`copy ${asset.path} to ${assetPath}`)
      await RNFS.copyFileAssets(asset.path, assetPath)
    }
  }
}

export const prepareAndroidAssets = async path => {
  if (await RNFS.exists(path)) {
    await RNFS.unlink(path)
  }
  await RNFS.mkdir(path)
  await copyAllFilesFromAndroidBundleAssets('cozy-home/build', path)
}

const copyAllFilesFromBundleIOSAssets = async (originPath, destinationPath) => {
  const content = await RNFS.readDir(originPath)
  for (let asset of content) {
    const assetPath = `${destinationPath}/${asset.name}`
    if (asset.isDirectory()) {
      await RNFS.mkdir(assetPath)
      await copyAllFilesFromBundleIOSAssets(asset.path, assetPath)
    } else {
      log.debug(`copy ${asset.path} to ${assetPath}`)
      await RNFS.copyFile(asset.path, assetPath)
    }
  }
}

export const prepareIOSAssets = async path => {
  if (await RNFS.exists(path)) {
    await RNFS.unlink(path)
  }
  await RNFS.mkdir(path)
  await copyAllFilesFromBundleIOSAssets(
    RNFS.MainBundlePath + '/assets/resources/' + 'cozy-home/build',
    path
  )
}

export const prepareAssets = async path => {
  log.debug('Copy bundle assets')
  const isIOS = Platform.OS === 'ios'
  if (isIOS) {
    await prepareIOSAssets(path)
  } else {
    await prepareAndroidAssets(path)
  }
}
