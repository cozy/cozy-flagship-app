import { CaptureConsole } from '@sentry/integrations'
import * as Sentry from '@sentry/react-native'
import type { Breadcrumb, Event, EventHint } from '@sentry/types'
import flow from 'lodash/fp/flow'

import strings from '/constants/strings.json'
import { devlog, EnvService, isSentryDebugMode } from '/core/tools/env'
import { scrubPhoneNumbers } from '/libs/monitoring/scrubbing'
import { version } from '/../package.json'

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

const logSend = (event: Event, hint?: EventHint): Event => {
  devlog('📟 - Sentry event sent', { event, hint })
  return event
}

const integrations = [new CaptureConsole({ levels: ['error', 'warn'] })]

Sentry.init({
  beforeBreadcrumb: (breadcrumb, hint) =>
    flow(scrubPhoneNumbers)(breadcrumb, hint) as Breadcrumb,
  beforeSend: (event, hint) =>
    flow(logSend, scrubPhoneNumbers)(event, hint) as Event,
  debug: isSentryDebugMode(),
  dsn: strings.SENTRY_DSN_URL,
  enabled: EnvService.hasSentryEnabled(),
  environment: EnvService.name,
  integrations,
  onReady: ({ didCallNativeInit }) =>
    didCallNativeInit &&
    devlog(`📟 - Sentry native SDK initialized with options: {
      debug: ${String(isSentryDebugMode())},
      enabled: ${String(EnvService.hasSentryEnabled())},
      dsn: ${strings.SENTRY_DSN_URL},
      environment: ${EnvService.name},
      integrations: ${JSON.stringify(integrations)}
    }`)
})

Sentry.setTag(SentryCustomTags.Version, version)
