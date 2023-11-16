import { getUniqueId } from 'react-native-device-info'

import { Log } from '/app/domain/geolocation/helpers'
import { storeId, getId } from '/app/domain/geolocation/tracking/storage'

const useUniqueDeviceId = false
const serverURL = 'https://openpath.cozycloud.cc'

export const getOrCreateId = async () => {
  try {
    let value = await getId()
    if (value == undefined) {
      Log('No current Id, generating a new one...')
      value = useUniqueDeviceId
        ? await getUniqueId()
        : Math.random().toString(36).replace('0.', '')
      await storeId(value) // random Id or device Id depending on config
      Log('Set Id to: ' + value)
    }

    return value
  } catch (error) {
    Log('Error while getting Id:' + error.toString())
    throw error
  }
}

export const createUser = async user => {
  let response = await fetch(serverURL + '/profile/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user: user })
  })
  if (!response.ok) {
    Log('Error creating user: ' + response.status + ' ' + response.statusText)
    throw new Error('FAILED_EMISSION_USER_CREATION') // Could be no Internet, offline server or unknown issue. Won't trigger if user already exists.
  } else {
    const jsonTokenResponse = await response.json()
    Log('Success creating user ' + user + ', UUID: ' + jsonTokenResponse.uuid)
  }
}

export const getOrCreateUser = async user => {
  let response
  try {
    const respFetch = await fetch(serverURL + '/profile/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user: user })
    })
    if (respFetch.status === 403) {
      return createUser(user)
    }
    response = await respFetch.json()
    const uuid = response?.user_id?.['$uuid']
    if (!uuid) {
      await createUser(user)
    }
    return uuid
  } catch (err) {
    return createUser(user)
  }
}

export const updateId = async newId => {
  // If there are still non-uploaded locations, it should be handled before changing the Id or they will be sent with the new one
  Log('Updating Id to ' + newId)

  if (newId.length > 2 && newId != (await getId())) {
    await storeId(newId)
    try {
      await createUser(newId)
      return 'SUCCESS_STORING_SUCCESS_CREATING'
    } catch (error) {
      return 'SUCCESS_STORING_FAIL_CREATING'
    }
  } else {
    return 'SAME_ID_OR_INVALID_ID'
  }
}
