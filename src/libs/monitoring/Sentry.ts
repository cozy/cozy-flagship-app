import * as Sentry from '@sentry/react-native'
import flow from 'lodash/fp/flow'
import { CaptureConsole } from '@sentry/integrations'
import { devConfig } from '/constants/dev-config'

import strings from '/constants/strings.json'
import { devlog, EnvService, isDev } from '/libs/services/EnvService'
import { scrubPhoneNumbers } from '/libs/monitoring/scrubbing'
import { version } from '../../../package.json'

const isDebugMode = isDev() && devConfig.sentry

export const SentryCustomTags = {
  Instance: 'cozy-instance',
  Version: 'cozy-version'
}

export const withSentry = Sentry.wrap

export const setSentryTag = (tag: string, value: string): void =>
  Sentry.setTag(tag, value)

export const logToSentry = (error: unknown): void => {
  Sentry.captureException(error)
}

Sentry.init({
  beforeBreadcrumb: (breadcrumb, hint) =>
    flow(scrubPhoneNumbers)(breadcrumb, hint) as Sentry.Breadcrumb,
  beforeSend: (event, hint) =>
    flow(scrubPhoneNumbers)(event, hint) as Sentry.Event,
  debug: isDebugMode,
  dsn: strings.SENTRY_DSN_URL,
  enabled: EnvService.hasSentryEnabled,
  environment: EnvService.name,
  integrations: [new CaptureConsole({ levels: ['error', 'warn'] })],
  onReady: ({ didCallNativeInit }) =>
    didCallNativeInit && isDebugMode && devlog('Sentry native SDK initialized')
})

Sentry.setTag(SentryCustomTags.Version, version)
