import Sentry from '@sentry/react-native'

import { devlog } from '/libs/services/EnvService'

export const scrubPhoneNumbers = (event: Sentry.Event): Sentry.Event => {
  if (event.message) {
    event.message = event.message.replace(/tel:[^ ]*/g, 'tel:XXXXXXXXXX')
    devlog.debug(`Scrubbed phone number in Sentry message: "${event.message}"`)
  }

  return event
}
