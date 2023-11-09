import { Command } from 'commander'

import Minilog from 'cozy-minilog'

import {
  configureBrand,
  checkCozyBrandIso,
  checkGitStatus,
  checkLanguages
} from './configure-brand'

export const logger = Minilog('Configure Brand CLI')

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
// @ts-ignore
Minilog.enable()

type AsyncVoidFunction<T extends unknown[]> = (...args: T) => Promise<void>

const handleErrors = <T extends unknown[]>(asyncFn: AsyncVoidFunction<T>) => {
  return async (...args: T): Promise<void> => {
    try {
      await asyncFn(...args)
    } catch (e) {
      logger.error(e)
      process.exit(1)
    }
  }
}

interface ConfigureOptions {
  force?: boolean
}

const errorColor = (str: string): string => {
  // Add ANSI escape codes to display text in red.
  return `\x1b[31m${str}\x1b[0m`
}

async function main(): Promise<void> {
  const program = new Command()

  program.name('brand').description('CLI to configure brands').version('0.0.1')

  program.configureOutput({
    outputError: (str, write) => write(errorColor(str))
  })

  program
    .command('configure')
    .description('Configure given brand')
    .argument('<brand>', 'brand name')
    .option('--force', 'force brand configuration if git status is not clean')
    .action(
      handleErrors(async (brand: string, options: ConfigureOptions) => {
        logger.info(`Configuring brand ${brand}`)

        if (!options.force) {
          const isGitClean = await checkGitStatus()

          if (!isGitClean) {
            program.error(
              'There are uncommited change in this git repository, please commit changes or run with --force'
            )
            return
          }
        } else {
          logger.warn('Git check has been skipped due to --force option')
        }

        await configureBrand(brand)
      })
    )

  program
    .command('check')
    .description(
      'Check that Cozy brand mirrors root files and that languages files are good'
    )
    .action(
      handleErrors(async () => {
        logger.info(`Check Cozy brand`)

        const isISO = await checkCozyBrandIso()

        if (!isISO) {
          program.error('Cozy brand is not sync with original files')
        }

        const areLanguageOk = checkLanguages()

        if (!areLanguageOk) {
          program.error('Language files are not sync with each other')
        }
      })
    )

  await program.parseAsync()
}

main().catch(e => {
  logger.error(e)
  process.exit(1)
})
