import { Breadcrumb, Event } from '@sentry/react-native'

import { devlog } from '/core/tools/env'

const isBreadcrumb = (event: Event | Breadcrumb): event is Breadcrumb =>
  (event as Breadcrumb).data !== undefined

const isEvent = (event: Event | Breadcrumb): event is Event =>
  (event as Event).breadcrumbs !== undefined

const hasConsoleArguments = (
  event: Breadcrumb
): event is Breadcrumb & { data: { arguments: string[] } } =>
  event.data?.arguments !== undefined

const scrubPhone = (message: string): string => {
  const startIndex = message.indexOf('tel:') + 'tel:'.length
  const nonSanitized = message.substring(0, startIndex)
  const sanitized = message.substring(startIndex).replace(/\d/g, '*')

  return `${nonSanitized}${sanitized}`
}

// Every number after "tel:" is replaced by "*"
export const scrubPhoneNumbers = (
  event: Event | Breadcrumb
): Event | Breadcrumb => {
  if (isBreadcrumb(event)) {
    if (hasConsoleArguments(event)) {
      const eventArgs = event.data.arguments
      const message = eventArgs.length > 0 ? eventArgs[0] : undefined

      if (message?.includes('tel:')) {
        const sanitizedMessage = scrubPhone(message)
        event.data.arguments[0] = sanitizedMessage
        event.message = sanitizedMessage
        devlog(
          `Scrubbed phone number in Sentry breadcrumb: "${sanitizedMessage}"`
        )
      }
    }
  }

  if (isEvent(event)) {
    if (event.message?.includes('tel:')) {
      const sanitizedMessage = scrubPhone(event.message)
      event.message = sanitizedMessage
      if (event.extra) event.extra.arguments = sanitizedMessage
      devlog(`Scrubbed phone number in Sentry event: "${sanitizedMessage}"`)
    }
  }

  return event
}
