import { Platform } from 'react-native'
import RNFS from 'react-native-fs'

import Minilog from 'cozy-minilog'

const log = Minilog('BundleAssets')

interface Manifest {
  version: string
}

const copyAllFilesFromAndroidBundleAssets = async (
  originPath: string,
  destinationPath: string
): Promise<void> => {
  const content = await RNFS.readDirAssets(originPath)
  for (const asset of content) {
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

export const prepareAndroidAssets = async (path: string): Promise<void> => {
  if (await RNFS.exists(path)) {
    await RNFS.unlink(path)
  }
  await RNFS.mkdir(path)
  await copyAllFilesFromAndroidBundleAssets('cozy-home/build', path)
}

const copyAllFilesFromBundleIOSAssets = async (
  originPath: string,
  destinationPath: string
): Promise<void> => {
  const content = await RNFS.readDir(originPath)
  for (const asset of content) {
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

export const prepareIOSAssets = async (path: string): Promise<void> => {
  if (await RNFS.exists(path)) {
    await RNFS.unlink(path)
  }
  await RNFS.mkdir(path)
  await copyAllFilesFromBundleIOSAssets(
    RNFS.MainBundlePath + '/assets/resources/' + 'cozy-home/build',
    path
  )
}

export const prepareAssets = async (path: string): Promise<void> => {
  log.debug('Copy bundle assets')
  const isIOS = Platform.OS === 'ios'
  if (isIOS) {
    await prepareIOSAssets(path)
  } else {
    await prepareAndroidAssets(path)
  }
}

const getIOSAssetManifestJSON = async (): Promise<string> => {
  const assetManifestPath = `${RNFS.MainBundlePath}/assets/resources/cozy-home/build/manifest.webapp`

  return await RNFS.readFile(assetManifestPath)
}

const getAndroidAssetManifestJSON = async (): Promise<string> => {
  const assetManifestPath = 'cozy-home/build/manifest.webapp'

  return await RNFS.readFileAssets(assetManifestPath)
}

const getAssetManifest = async (): Promise<Manifest> => {
  const isIOS = Platform.OS === 'ios'

  const manifestJSON = isIOS
    ? await getIOSAssetManifestJSON()
    : await getAndroidAssetManifestJSON()

  const manifest = JSON.parse(manifestJSON) as Manifest

  return manifest
}

export const getAssetVersion = async (): Promise<string> => {
  const manifest = await getAssetManifest()

  const version = manifest.version

  log.debug(`Assets version is ${version}`)

  return version
}
