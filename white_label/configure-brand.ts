import { exec } from 'child_process'
import path from 'path'

import merge from 'deepmerge-json'
import fs from 'fs-extra'

import Minilog from 'cozy-minilog'

import configs from './config.json'

export const logger = Minilog('Configure Brand')

export const checkGitStatus = async (): Promise<boolean> => {
  logger.info('Check git status')
  const result = await executeCommand('git status --porcelain -z')

  return result.length === 0
}

export const checkCozyBrandIso = async (): Promise<boolean> => {
  const isAndroidIso = await checkBrandFolderIso('android', 'android')
  const isIosIso = await checkBrandFolderIso('ios', 'ios')
  const isJsIso = await checkBrandFolderIso('js', 'src')

  return isAndroidIso && isIosIso && isJsIso
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
    await configureEnv(brand)
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
  if (process.platform !== 'darwin') {
    logger.warn('Skip iOS configuration (platform !== iOS)')
    return
  }

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

  logger.info('Edit iOS project file')
  const pbxprojPath = './ios/CozyReactNative.xcodeproj/project.pbxproj'
  await replaceStringsInFile(pbxprojPath, [
    {
      from: /PRODUCT_BUNDLE_IDENTIFIER = io\.cozy\.flagship\.mobile.*CozyShare.*\n/g,
      to: `PRODUCT_BUNDLE_IDENTIFIER = ${config.bundleId}.CozyShare;\n`
    },
    {
      from: /PRODUCT_BUNDLE_IDENTIFIER = io\.cozy\.flagship\.mobile((?!CozyShare).)*\n/g,
      to: `PRODUCT_BUNDLE_IDENTIFIER = ${config.bundleId};\n`
    },
    {
      from: /"PROVISIONING_PROFILE_SPECIFIER\[sdk=iphoneos\*\]" = "amiral-.*dev-profile";/g,
      to: `"PROVISIONING_PROFILE_SPECIFIER[sdk=iphoneos*]" = "${config.provisionningDevProfile}";`
    }
  ])

  logger.info('Copy iOS files')
  await fs.copy(`./white_label/brands/${brand}/ios`, './ios', {
    overwrite: true
  })
}

const configureJS = async (brand: string): Promise<void> => {
  logger.info('Copy JS files')
  const basePath = `white_label/brands/${brand}/js`

  // @ts-ignore
  for (const file of readAllFiles(`./white_label/brands/${brand}/js`)) {
    if (typeof file !== 'string') {
      continue
    }
    const relativePath = file.replace(basePath, '')
    const originalFile = path.join('./src', relativePath).replace('extra-', '')

    if (isJsonOverrideFile(relativePath)) {
      const merged = await mergeJsonFiles(originalFile, file)
      await fs.writeFile(originalFile, merged)
    } else {
      await fs.copy(file, originalFile)
    }
  }
}

const configureEnv = async (brand: string): Promise<void> => {
  logger.info('Edit .env file')
  const config = configs[brand as keyof typeof configs]
  const envContent = await fs.readFile('.env', 'utf8')
  let newEnvContent = envContent

  newEnvContent = setOrReplaceVariable(
    newEnvContent,
    'USER_AGENT',
    config.userAgent
  )

  if (envContent !== newEnvContent) {
    logger.warn(
      '.env file has been modified, please run `pod install` to apply changes'
    )
  }

  await fs.writeFile('.env', newEnvContent)
}

const setOrReplaceVariable = (
  envContent: string,
  variableName: string,
  value: string
): string => {
  let newEnvContent = envContent

  const userAgentRegex = new RegExp(`^${variableName}=".*"`, 'm')
  const newUserAgent = `${variableName}="${value}"`

  if (userAgentRegex.test(newEnvContent)) {
    newEnvContent = newEnvContent.replace(userAgentRegex, newUserAgent)
  } else {
    newEnvContent += `\n${newUserAgent}\n`
  }

  return newEnvContent
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

interface ReplaceItem {
  from: RegExp
  to: string
}

const replaceStringsInFile = async (
  file: string,
  replaceList: ReplaceItem[]
): Promise<void> => {
  try {
    let fileContent = await fs.readFile(file, 'utf8')

    for (const item of replaceList) {
      fileContent = fileContent.replace(item.from, item.to)
    }

    await fs.writeFile(file, fileContent)
  } catch (error) {
    logger.error(error)
  }
}

function* readAllFiles(dir: string): Generator<string> {
  const files = fs.readdirSync(dir, { withFileTypes: true })

  for (const file of files) {
    if (file.isDirectory()) {
      // @ts-ignore
      yield* readAllFiles(path.join(dir, file.name))
    } else {
      yield path.join(dir, file.name)
    }
  }
}

const areFilesEqual = (file1: string, file2: string): boolean => {
  const file1Buffer = fs.readFileSync(file1)
  const file2Buffer = fs.readFileSync(file2)

  return file1Buffer.equals(file2Buffer)
}

const mergeJsonFiles = async (
  baseFile: string,
  overrideFile: string
): Promise<string> => {
  const baseContentString = await fs.readFile(baseFile, 'utf8')
  const overrideContentString = await fs.readFile(overrideFile, 'utf8')

  const baseContentJson = JSON.parse(baseContentString)
  const overrideContentJson = JSON.parse(overrideContentString)

  const mergedJson = merge(baseContentJson, overrideContentJson)

  return JSON.stringify(mergedJson, null, 2) + '\n'
}

export const checkBrandFolderIso = async (
  folderBrand: string,
  folderOrigin: string
): Promise<boolean> => {
  let isISO = true

  const basePath = `white_label/brands/cozy/${folderBrand}`

  // @ts-ignore
  for (const file of readAllFiles(`./white_label/brands/cozy/${folderBrand}`)) {
    if (typeof file !== 'string') {
      continue
    }
    const relativePath = file.replace(basePath, '')
    const originalFile = path
      .join(`./${folderOrigin}`, relativePath)
      .replace('extra-', '')

    if (!fs.existsSync(originalFile)) {
      logger.error(`${relativePath} does not exist`)
      isISO = false
      continue
    }

    if (isJsonOverrideFile(relativePath)) {
      const areEqual = await areJsonFilesEqual(originalFile, file)
      if (!areEqual) {
        logger.error(
          `${relativePath} contains keys that are not in the original file`
        )
        isISO = false
        continue
      }
    } else {
      const areEqual = areFilesEqual(file, originalFile)
      if (!areEqual) {
        logger.error(`${relativePath} is different`)
        isISO = false
        continue
      }
    }
  }

  return isISO
}

const isJsonOverrideFile = (filePath: string): boolean => {
  const isJsonFile = path.extname(filePath) === '.json'
  const isOverrideFile = path.basename(filePath).startsWith('extra-')

  return isJsonFile && isOverrideFile
}

const areJsonFilesEqual = async (
  file1: string,
  file2: string
): Promise<boolean> => {
  const file1Json = fs.readFileSync(file1, 'utf8')
  const file2Json = await mergeJsonFiles(file1, file2)

  return file1Json == file2Json
}
