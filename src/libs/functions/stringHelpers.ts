/**
 * Returns a new string with all special characters escaped
 *
 * @param {string} str - the reference string to escape
 * @returns {string}
 */
export const escapeSpecialCharacters = str => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Returns a new string with all matches of `find` replaced by the `replace` string.
 * The original string is left unchanged.
 *
 * @param {string} str - the reference string
 * @param {string} find - the string that is to be replaced by the `replace` string
 * @param {string} replace - the string that replaces the `find` substring
 * @returns {string}
 */
export const replaceAll = (str, find, replace) => {
  const escapedString = escapeSpecialCharacters(find)
  const regex = new RegExp(escapedString, 'g')

  return str.replace(regex, replace)
}

/**
 * Normalize FQDN to make it usable as a folder name
 *
 * @param {string} fqdn - FQDN to be normalized
 * @returns {string} normalized FQDN
 */
export const normalizeFqdn = fqdn => {
  const normalizedFqdn = fqdn.replace(':', '_')

  return normalizedFqdn
}
