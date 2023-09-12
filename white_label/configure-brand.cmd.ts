import { Command } from 'commander'

import Minilog from 'cozy-minilog'

import { configureBrand, checkGitStatus } from './configure-brand'

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

async function main(): Promise<void> {
  const program = new Command()

  program.name('brand').description('CLI to configure brands').version('0.0.1')

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

  await program.parseAsync()
}

main().catch(e => {
  logger.error(e)
  process.exit(1)
})
