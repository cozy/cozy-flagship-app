import { exec } from 'child_process'

import fs from 'fs-extra'

import Minilog from 'cozy-minilog'

import configs from './config.json'

export const logger = Minilog('Configure Brand')

export const checkGitStatus = async (): Promise<boolean> => {
  logger.info('Check git status')
  const result = await executeCommand('git status --porcelain -z')

  return result.length === 0
}

export const configureBrand = async (brand: string): Promise<void> => {
  try {
    if (!Object.keys(configs).includes(brand)) {
      logger.error(
        `Brand "${brand}" does not exist in available configurations`
      )
      return
    }

    await configureAndroid(brand)
    await configureIOS(brand)
    await configureJS(brand)
  } catch (error) {
    logger.error('Could not apply changes:', error)
  }
}

const configureAndroid = async (brand: string): Promise<void> => {
  logger.info('Copy Android files')
  await fs.copy(`./white_label/brands/${brand}/android`, './android', {
    overwrite: true
  })
}

const configureIOS = async (brand: string): Promise<void> => {
  const config = configs[brand as keyof typeof configs]

  logger.info('Set iOS Bundle ID')
  await executeCommand(
    `/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier ${config.bundleId}" ios/CozyReactNative/Info.plist`
  )

  logger.info('Set iOS App Name')
  await executeCommand(
    `/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName ${config.appName}" ios/CozyReactNative/Info.plist`
  )

  logger.info('Set iOS App Scheme')
  await executeCommand(
    `/usr/libexec/PlistBuddy -c "Set :CFBundleURLTypes:0:CFBundleURLSchemes:0 ${config.scheme}" ios/CozyReactNative/Info.plist`
  )

  logger.info('Copy iOS files')
  await fs.copy(`./white_label/brands/${brand}/ios`, './ios', {
    overwrite: true
  })
}

const configureJS = async (brand: string): Promise<void> => {
  logger.info('Copy JS files')
  await fs.copy(`./white_label/brands/${brand}/js`, './src', {
    overwrite: true
  })
}

const executeCommand = async (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }
      if (stderr) {
        reject(stderr)
        return
      }
      resolve(stdout)
    })
  })
}
