import Minilog from '@cozy/minilog'

import CozyClient, { generateWebLink } from 'cozy-client'
import { getNativeIntentService } from 'cozy-intent'

import { BackupInfo } from '/app/domain/backup/models'

const log = Minilog('💿 Backup')

const getPhotosUri = (client: CozyClient): string => {
  const cozyUrl = client.getStackClient().uri
  const subDomainType = client.getInstanceOptions().capabilities.flat_subdomains
    ? 'flat'
    : 'nested'

  const photosUri = generateWebLink({
    cozyUrl,
    subDomainType,
    slug: 'photos',
    pathname: '',
    hash: '',
    searchParams: []
  })

  return photosUri
}

const getHomeUri = (client: CozyClient): string => {
  const cozyUrl = client.getStackClient().uri
  const subDomainType = client.getInstanceOptions().capabilities.flat_subdomains
    ? 'flat'
    : 'nested'

  const homeUri = generateWebLink({
    cozyUrl,
    subDomainType,
    slug: 'home',
    pathname: '',
    hash: '',
    searchParams: []
  })

  return homeUri
}

export const sendProgressToWebview = async (
  client: CozyClient,
  backupInfo: BackupInfo
): Promise<void> => {
  const nativeIntentService = getNativeIntentService()

  const photosUri = getPhotosUri(client)
  const homeUri = getHomeUri(client)

  try {
    await nativeIntentService.call(photosUri, 'updateBackupInfo', backupInfo)
  } catch (e) {
    if (e instanceof Error) {
      log.debug('Error when sending backup info to photos app', e.message)
    }
  }

  try {
    await nativeIntentService.call(homeUri, 'updateBackupInfo', backupInfo)
  } catch (e) {
    if (e instanceof Error) {
      log.debug('Error when sending backup info to home app', e.message)
    }
  }
}
