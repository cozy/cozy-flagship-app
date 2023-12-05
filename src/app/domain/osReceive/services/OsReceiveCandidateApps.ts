import CozyClient, { Registry } from 'cozy-client'
import { RegistryApp } from 'cozy-client/types/registry'
import { getErrorMessage } from 'cozy-intent'

import mime from 'mime/lite'
import RNFS from 'react-native-fs'

import { OsReceiveLogger } from '/app/domain/osReceive'
import {
  AcceptFromFlagshipManifest,
  AppForUpload,
  WillAcceptFromFlagshipManifest,
  isWillAcceptFromFlagshipManifest,
  fetchStackApp
} from '/app/domain/osReceive/models/OsReceiveCozyApp'
import { OsReceiveFile } from '/app/domain/osReceive/models/OsReceiveState'
import { t } from '/locales/i18n'

export const getAppsForUpload = async (
  filesToUpload: OsReceiveFile[],
  candidateApps: AcceptFromFlagshipManifest[]
): Promise<AppForUpload[]> => {
  const acceptFromFlagshipApps: WillAcceptFromFlagshipManifest[] =
    candidateApps.filter(isWillAcceptFromFlagshipManifest)

  const appsForUpload = (
    await Promise.all(
      acceptFromFlagshipApps
        .map(checkFileNumberLimit(filesToUpload))
        .map(checkFileMimes(filesToUpload))
        .map(checkFileSizeLimitAsync(filesToUpload))
        .map(toAppForUpload)
    )
  )
    // @ts-expect-error type issue during rebasing
    .sort(putDriveLast)

  return appsForUpload
}

type MaybePromise_WillAcceptFromFlagshipManifest =
  | WillAcceptFromFlagshipManifest
  | Promise<WillAcceptFromFlagshipManifest>

const checkFileNumberLimit =
  (filesToUpload: OsReceiveFile[]) =>
  async (
    appPromise: MaybePromise_WillAcceptFromFlagshipManifest
  ): Promise<WillAcceptFromFlagshipManifest> => {
    const app = await appPromise
    const maxNumberOfFiles =
      app.accept_documents_from_flagship.max_number_of_files

    const acceptNumberOfFiles = maxNumberOfFiles >= filesToUpload.length
    if (acceptNumberOfFiles) {
      return app
    }

    const reason =
      maxNumberOfFiles === 1
        ? t('services.osReceive.disableReasons.multipleFiles', {
            appname: app.name
          })
        : t('services.osReceive.disableReasons.tooManyFiles', {
            numberOfFiles: filesToUpload.length,
            maxNumberOfFiles: maxNumberOfFiles,
            appname: app.name
          })

    const reasons = app.reasonDisabled
      ? [...app.reasonDisabled, reason]
      : [reason]

    return {
      ...app,
      reasonDisabled: reasons
    }
  }

const checkFileMimes =
  (filesToUpload: OsReceiveFile[]) =>
  async (
    appPromise: MaybePromise_WillAcceptFromFlagshipManifest
  ): Promise<WillAcceptFromFlagshipManifest> => {
    const app = await appPromise
    const acceptedMime = app.accept_documents_from_flagship.accepted_mime_types

    const acceptAllMimes =
      acceptedMime.includes('*/*') ||
      filesToUpload.every(file => {
        const guessedMimeType =
          mime.getType(file.file.mimeType) ?? file.file.mimeType

        return app.accept_documents_from_flagship.accepted_mime_types.includes(
          guessedMimeType
        )
      })

    if (acceptAllMimes) {
      return app
    }

    const reason = t('services.osReceive.disableReasons.incompatibleMime', {
      appname: app.name
    })
    const reasons = app.reasonDisabled
      ? [...app.reasonDisabled, reason]
      : [reason]

    return {
      ...app,
      reasonDisabled: reasons
    }
  }

const checkFileSizeLimitAsync =
  (filesToUpload: OsReceiveFile[]) =>
  async (
    appPromise: MaybePromise_WillAcceptFromFlagshipManifest
  ): Promise<WillAcceptFromFlagshipManifest> => {
    const app = await appPromise
    const maximumSizeInB =
      app.accept_documents_from_flagship.max_size_per_file_in_MB * 1000 * 1000

    const filesSizesInB = await Promise.all(
      filesToUpload.map(async file => {
        const fileStats = await RNFS.stat(file.file.filePath)
        return fileStats.size
      })
    )

    const areAllFilesUnderSizeLimit = filesSizesInB.every(
      size => size <= maximumSizeInB
    )

    if (areAllFilesUnderSizeLimit) {
      return app
    }

    const reason = t('services.osReceive.disableReasons.tooLargeFiles', {
      appname: app.name
    })
    const reasons = app.reasonDisabled
      ? [...app.reasonDisabled, reason]
      : [reason]

    return {
      ...app,
      reasonDisabled: reasons
    }
  }

const toAppForUpload = async (
  appPromise: MaybePromise_WillAcceptFromFlagshipManifest
): Promise<AppForUpload> => {
  const app = await appPromise

  return {
    name: overrideAppName(app),
    slug: app.slug,
    reasonDisabled: app.reasonDisabled,
    routeToUpload: app.accept_documents_from_flagship.route_to_upload
  }
}

const putDriveLast = (
  appA: WillAcceptFromFlagshipManifest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appB: WillAcceptFromFlagshipManifest
): number => {
  if (appA.slug === 'drive') {
    return 1
  }

  return -1
}

const overrideAppName = (app: WillAcceptFromFlagshipManifest): string => {
  if (['mespapiers', 'photos', 'drive'].includes(app.slug)) {
    return t(`services.osReceive.appNameOverrides.${app.slug}`)
  }

  return app.name
}

// TODO: remove this type when cozy-client types are fixed
type RegistryAppWithAcceptFromFlagship = RegistryApp & {
  latest_version?: {
    manifest: AcceptFromFlagshipManifest
  }
}

export const fetchRegistryApps = async (
  client: CozyClient
): Promise<AcceptFromFlagshipManifest[]> => {
  try {
    const registry = new Registry({ client })
    const apps = (await registry.fetchApps({
      channel: 'stable',
      type: 'webapp',
      limit: '200'
    })) as RegistryAppWithAcceptFromFlagship[]

    return apps
      .filter(app => app.latest_version?.manifest.accept_from_flagship)
      .map(app => app.latest_version?.manifest as AcceptFromFlagshipManifest)
  } catch (error) {
    OsReceiveLogger.error(
      'fetchRegistryApps error, defaulting to empty array',
      error
    )
    return []
  }
}

export const hasAppInstalled = async (
  client: CozyClient,
  slug: string
): Promise<boolean> => {
  try {
    const params = fetchStackApp(slug)
    await client.query(params.definition, params.options)
    return true
  } catch (error) {
    if (getErrorMessage(error).includes('not installed')) return false

    throw error
  }
}
