/**
 * @typedef {object} PasswordData
 * @property {string} password - The user's password
 * @property {string} hint - The user's hint
 */

/**
 * @typedef {object} LoginData
 * @property {string} passwordHash - The user's hashed password
 * @property {string} hint - The user's hint
 * @property {string} iterations - The number of iterations used to hash the password
 * @property {string} key -
 * @property {string} publicKey -
 * @property {string} privateKey -
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
 * @typedef {('STATE_CONNECTED'|'STATE_2FA_NEEDED'|'STATE_INVALID_PASSWORD')} CozyClientCreationState
 */

/**
 * @typedef {object} CozyClientCreationContext
 * @property {CozyClient} client - The CozyClient instance
 * @property {CozyClientCreationState} state - The state of the CozyClient instance
 * @property {string} twoFactorToken - Token used for the 2FA workflow
 */

/**
 * @typedef {object} TwoFactorAuthenticationData
 * @property {string} token - Token used for the 2FA workflow
 * @property {string} passcode - Code entered by the user
 */

/**
 * @typedef {object} SessionCodeResult
 * @property {string} [session_code] - The session code, when defined it means that the query succeeded
 * @property {string} [twoFactorToken] - The 2FA token, when defined it means that the user needs to pass the 2FA step
 * @property {boolean} [invalidPassword] - Boolean that, when defined, indicates if the stack returned an invalid password error
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
 * Set error.
 * @callback setErrorCallback
 * @param {object} error
 */

/**
 * Start the onbaording process with provided FQDN and registerToken.
 * @callback startOnboarding
 * @param {object} param
 * @param {string} param.fqdn
 * @param {string} param.registerToken
 */
