import { CaptureConsole } from '@sentry/integrations'
import * as Sentry from '@sentry/react-native'
import flow from 'lodash/fp/flow'

import strings from '/constants/strings.json'
import { devlog, EnvService, isSentryDebugMode } from '/core/tools/env'
import { scrubPhoneNumbers } from '/libs/monitoring/scrubbing'

import { version } from '../../../package.json'

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
  debug: isSentryDebugMode(),
  dsn: strings.SENTRY_DSN_URL,
  enabled: EnvService.hasSentryEnabled,
  environment: EnvService.name,
  integrations: [new CaptureConsole({ levels: ['error', 'warn'] })],
  onReady: ({ didCallNativeInit }) =>
    didCallNativeInit &&
    isSentryDebugMode() &&
    devlog('Sentry native SDK initialized')
})

Sentry.setTag(SentryCustomTags.Version, version)
