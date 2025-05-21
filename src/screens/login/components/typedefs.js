/**
 * @typedef {object} PasswordData
 * @property {string} password - The user's password
 * @property {string} [hint] - The user's hint
 */

/**
 * @typedef {object} InstanceData
 * @property {string} instance - The Cozy's url
 * @property {string} fqdn - The Cozy's fqdn
 */

/**
 * @typedef {object} ButtonInfo
 * @property {Function} callback - Function to call when the button is clicked
 * @property {string} title - Title of the button
 */

/**
 * @typedef {object} CozyPublicData
 * @property {string} name - The user's name as configured in the Cozy's settings
 * @property {string} kdfIterations - The number of KDF iterations that should be applied to the user's password in order to derivate encryption keys
 */

/**
 * @typedef {object} TransitionPasswordAvatarPosition
 * @property {number} top - The avatar's top position relative to the HTML view
 * @property {number} left - The avatar's left position relative to the HTML view
 * @property {number} height - The avatar's height
 * @property {number} width - The avatar's width
 * @property {number} boxHeight - The avatar's height, considering image margins and borders
 * @property {number} boxWidth - The avatar's width, considering image margins and borders
 */

/**
 * Set the readonly state.
 * @callback setReadonly
 * @param {boolean} isReadOnly
 */

/**
 * Set the login data.
 * @callback setLoginDataCallback
 * @param {LoginData} loginData
 */

/**
 * Set the password data.
 * @callback setPasswordData
 * @param {PasswordData} passwordData
 */

/**
 * Set the instance data.
 * @callback setInstanceData
 * @param {InstanceData} instanceData
 */

/**
 * Set the 2FA code.
 * @callback setTwoFactorCode
 * @param {string} twoFactorCode
 */

/**
 * Set the LoginScreen theme.
 * @callback setClouderyTheme
 * @param {import('/screens/login/components/functions/clouderyThemeFetcher').ClouderyTheme} theme
 */

/**
 * Start OIDC Oauth process.
 * @callback startOidcOAuth
 * @param {string} fqdn
 * @param {string} code
 * @returns {Promise<void>}
 */

/**
 * Start OIDC Oauth process for current instance without code.
 * @callback startOidcOauthNoCode
 * @param {string} instance
 */

/**
 * Start OIDC Onboarding process.
 * @callback startOidcOnboarding
 * @param {string} onboardUrl
 * @param {string} code
 * @returns {Promise<void>}
 */

/**
 * Set error.
 * @callback setErrorCallback
 * @param {string} errorMessage
 * @param {object} error
 */

/**
 * Start the onbaording process with provided FQDN and registerToken.
 * @callback startOnboarding
 * @param {object} param
 * @param {string} param.fqdn
 * @param {string} param.registerToken
 */
