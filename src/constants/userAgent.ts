import { version } from '../../package.json'

import strings from '/constants/strings.json'

// This is the User-Agent that is globally used in the application.
export const USER_AGENT = `${strings.USER_AGENT}-${version}`

// This is User-Agent that is used in the application for the webviews.
export const APPLICATION_NAME_FOR_USER_AGENT = USER_AGENT
