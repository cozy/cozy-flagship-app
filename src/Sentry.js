import * as Sentry from '@sentry/react-native'
import { CaptureConsole } from '@sentry/integrations'

import { EnvService } from '/libs/services/EnvService'
import { version } from '../package.json'

// Sentry Data Source Name
// A DSN tells a Sentry SDK where to send events so the events are associated with the correct project.
// https://docs.sentry.io/product/sentry-basics/dsn-explainer/
const SentryDsn =
  'https://73d1bdec0dad488bb8781dfcfe083380@errors.cozycloud.cc/17'

// Available custom tags as enum-like object.
export const SentryTags = {
  Version: 'cozy-version',
  Instance: 'cozy-instance'
}

// Runtime initialisation.
Sentry.init({
  dsn: SentryDsn,
  enabled: EnvService.hasSentryEnabled,
  environment: EnvService.name,
  integrations: [new CaptureConsole({ levels: ['error', 'warn'] })]
})

// Runtime default configuration.
Sentry.setTag(SentryTags.Version, version)

// Public interface as functions.
export const withSentry = Sentry.wrap

export const setSentryTag = (tag, value) => Sentry.setTag(tag, value)
