import chalk, { ForegroundColor, BackgroundColor } from 'chalk'
import fs from 'fs-extra'
import https from 'https'
import tar from 'tar'

// eslint-disable-next-line no-console
const log = process.env.JEST_WORKER_ID ? (): void => void 0 : console.log

type formatter = typeof ForegroundColor | typeof BackgroundColor

type timerFn = (description?: string, formatter?: formatter) => void

const startTimer = (description: string, formatter?: formatter): timerFn => {
  const start = new Date().getTime()

  log(`\n${chalk[formatter ?? 'blue'](description)}`)

  return (description?: string, formatter?: formatter): void => {
    const end = new Date().getTime()

    description && log(`\n${chalk[formatter ?? 'green'](description)}`)
    log(chalk.yellow(`Time: ${end - start}ms`))
  }
}

export const installHomeRegistry = async (
  registryUrl: string,
  directories: [string, string]
): Promise<void> => {
  const endTimer = startTimer(
    'Starting cozy-home installation...',
    'blueBright'
  )

  try {
    ensureDirsExist(directories)

    emptyCurrentDirs(directories)

    const { url } = await getTarballUrl(registryUrl)

    await getTarball(url, directories)

    endTimer('Installation complete!', 'greenBright'), log('')
  } catch (error) {
    log(chalk.red('Failed to install cozy-home from the registry', '\n', error))

    throw error
  }
}

const ensureDirsExist = (directories: [string, string]): void => {
  const endTimer = startTimer('Ensuring directories exist...')

  directories.forEach(dir => fs.ensureDirSync(dir))

  endTimer()
}

const emptyCurrentDirs = (directories: [string, string]): void => {
  const endTimer = startTimer('Emptying current directories...')

  directories.forEach(dir => fs.emptyDirSync(dir))

  endTimer()
}

const getTarballUrl = (registryUrl: string): Promise<{ url: string }> =>
  new Promise((resolve, reject) => {
    const endTimer = startTimer('Getting tarball url...')

    https
      .get(registryUrl, res => {
        let data = ''
        res.on('data', chunk => (data += chunk))

        res.on('end', () => {
          resolve({ url: (JSON.parse(data) as { url: string }).url })
          endTimer()
        })
      })
      .on('error', error => reject(error))
  })

const getTarball = (
  url: string,
  directories: [string, string]
): Promise<void> =>
  new Promise((resolve, reject) => {
    const endTimer = startTimer('Getting tarball...')

    https
      .get(url, res => {
        endTimer()
        const endExtractTimer = startTimer('Extracting tarball in both OS...')

        let finished = false

        directories.forEach(dir => {
          res.pipe(tar.x({ C: dir })).on('end', () => {
            if (!finished) finished = true
            else {
              endExtractTimer()
              resolve()
            }
          })
        })
      })
      .on('error', error => reject(error))
  })
