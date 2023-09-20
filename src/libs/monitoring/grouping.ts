import { Event } from '@sentry/react-native'

export const groupBackupErrors = (event: Event): Event => {
  if (
    event.message &&
    event.message.includes('Backup') &&
    event.message.includes('not uploaded or set as backuped correctly')
  ) {
    event.fingerprint = ['backup-upload-error']
  }

  return event
}
