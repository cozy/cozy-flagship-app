import Config from 'react-native-config'

import { version } from '../../package.json'

const userAgentNamespace = Config.USER_AGENT ?? 'io.cozy.unknown.mobile'

// This is the User-Agent that is globally used in the application.
export const USER_AGENT = `${userAgentNamespace}-${version}`

// This is User-Agent that is used in the application for the webviews.
export const APPLICATION_NAME_FOR_USER_AGENT = USER_AGENT
