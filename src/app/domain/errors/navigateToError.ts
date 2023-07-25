import strings from '/constants/strings.json'
import { routes } from '/constants/routes'
import { navigate } from '/libs/RootNavigation'
import { isErrorReason, isFetchError } from '/libs/clientHelpers/types'

/**
 * Navigate to the Error page corresponding to the given error
 *
 * If no dedicated Error page is found for the given error, then
 * retidrect to Generic Error page
 */
export const navigateToError = (
  errorMessage: string,
  error: Error,
  backgroundColor: string
): void => {
  if (isErrorAboutNotOnboardedCozy(error)) {
    navigate(routes.error, {
      type: strings.errorScreens.cozyNotOnboarded,
      backgroundColor
    })
    return
  }

  if (isErrorAboutBlockedCozy(error)) {
    navigate(routes.error, {
      type: strings.errorScreens.cozyBlocked,
      backgroundColor
    })
    return
  }

  navigate(routes.error, {
    type: strings.errorScreens.genericError,
    backgroundColor,
    error: {
      message: errorMessage,
      details: JSON.stringify(error, null, ' ')
    }
  })
}

const isErrorAboutNotOnboardedCozy = (error: unknown): boolean => {
  if (!isFetchError(error)) {
    return false
  }

  return (
    error.status === 412 &&
    isErrorReason(error.reason) &&
    error.reason?.error === 'the instance has not been onboarded'
  )
}

const isErrorAboutBlockedCozy = (error: unknown): boolean => {
  if (!isFetchError(error)) {
    return false
  }

  return (
    error.status === 503 &&
    Array.isArray(error.reason) &&
    error.reason.some(
      reason =>
        typeof reason === 'object' &&
        reason !== null &&
        'title' in reason &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        reason.title === 'Blocked'
    )
  )
}
