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
 * @typedef {object} ButtonInfo
 * @property {Function} callback - Function to call when the button is clicked
 * @property {string} title - Title of the button
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
 * Set error.
 * @callback setErrorCallback
 * @param {object} error
 */
