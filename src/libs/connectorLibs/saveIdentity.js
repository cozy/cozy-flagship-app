import updateOrCreate from './updateOrCreate'
import Minilog from '@cozy/minilog'
const log = Minilog('saveIdentity')

/**
 * Set or merge a io.cozy.identities
 *
 * You need full permission for the doctype io.cozy.identities in your
 * manifest, to be able to use this function.
 *
 * @param {Object}: the identity to create/update as an object io.cozy.contacts
 * @param {String}: a string that represent the account use
 * ```javascript
 * const identity =
 *   {
 *     name: 'toto',
 *     email: { 'address': 'toto@example.com' }
 *   }
 *
 * await saveIdentity(identity, identity.email.address)
 * ```
 */

const saveIdentity = async (contact, accountIdentifier, options) => {
  log.debug('saving user identity', accountIdentifier)
  if (accountIdentifier == null) {
    log.warn("Can't set identity as no accountIdentifier was provided")
    return
  }
  if (contact == null) {
    log.warn("Can't set identity as no contact was provided")
    return
  }
  // Format contact if needed
  if (contact.phone) {
    contact.phone = formatPhone(contact.phone)
  }
  if (contact.address) {
    contact.address = formatAddress(contact.address)
  }

  const identity = {
    identifier: accountIdentifier,
    contact,
  }

  await updateOrCreate(
    [identity],
    'io.cozy.identities',
    ['identifier', 'cozyMetadata.createdByApp'],
    options,
  )
  return
}

/* Remove html and cariage return in address
 */
function formatAddress(address) {
  for (const element of address) {
    if (element.formattedAddress) {
      element.formattedAddress = element.formattedAddress
        .replace(/<[^>]*>/g, '') // Remove all html Tag
        .replace(/\r\n|[\n\r]/g, ' ') // Remove all kind of return character
      address[address.indexOf(element)] = element
    }
  }
  return address
}

/* Replace all characters in a phone number except '+' or digits
 */
function formatPhone(phone) {
  for (const element of phone) {
    if (element.number) {
      element.number = element.number.replace(/[^\d.+]/g, '')
      phone[phone.indexOf(element)] = element
    }
  }
  return phone
}

module.exports = saveIdentity
