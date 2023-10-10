import BackgroundGeolocation from 'react-native-background-geolocation'

import {
  setLastPointUploaded,
  smartSend
} from '/app/domain/geolocation/tracking/tracking'
import { getOrCreateId } from '/app/domain/geolocation/tracking/user'
import { StorageKeys, storeData, getData } from '/libs/localStore/storage'
import { Log } from '/app/domain/geolocation/helpers'

const DestroyLocalOnSuccess = true

const serverURL = 'https://openpath.cozycloud.cc'
const heavyLogs = false // Log points, motion changes...

const storeFlagFailUpload = async Flag => {
  try {
    await storeData(
      StorageKeys.FlagFailUploadStorageAdress,
      Flag ? 'true' : 'false'
    )
  } catch (error) {
    Log('Error while storing FlagFailUpload:' + error.toString())
    throw error
  }
}

export const getFlagFailUpload = async () => {
  try {
    let value = await getData(StorageKeys.FlagFailUploadStorageAdress)
    if (value == undefined) {
      await storeFlagFailUpload(false)
      return false
    } else {
      return value == 'true'
    }
  } catch (error) {
    Log('Error while getting FlagFailUpload:' + error.toString())
    throw error
  }
}

export const uploadUserCache = async (
  content,
  user,
  uuidsToDeleteOnSuccess,
  lastPointToSave = undefined
) => {
  Log('Uploading content to usercache...')
  let JsonRequest = {
    user: user,
    phone_to_server: content
  }

  let response = await fetch(serverURL + '/usercache/put', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(JsonRequest)
  })

  if (heavyLogs) {
    Log('Uploaded: ' + JSON.stringify(JsonRequest))
  }

  if (!response.ok) {
    throw new Error(
      String(
        'Error in request response:',
        response.status,
        response.statusText,
        await response.text()
      )
    )
  } else {
    Log('Success uploading')
    if (lastPointToSave != undefined) {
      await setLastPointUploaded(lastPointToSave)
      Log('Saved last point')
    } else {
      Log('No last point to save')
    }
    if (DestroyLocalOnSuccess && uuidsToDeleteOnSuccess.length > 0) {
      Log('Removing local location records that were just uploaded...')
      for (
        let deleteIndex = 0;
        deleteIndex < uuidsToDeleteOnSuccess.length;
        deleteIndex++
      ) {
        const element = uuidsToDeleteOnSuccess[deleteIndex]
        await BackgroundGeolocation.destroyLocation(element)
      }
      Log('Done removing local locations')
    }
  }
}

export const uploadData = async ({ untilTs = 0, force = false } = {}) => {
  // WARNING: la valeur de retour (booleen) indique le succès, mais mal géré dans le retryOnFail (actuellement uniquement utilisé pour le bouton "Forcer l'upload" avecec force et pas de retry)

  Log('Starting upload process' + (force ? ', forced' : ''))

  try {
    const locations = await BackgroundGeolocation.getLocations()
    let filteredLocations
    // Filter out locations that might tracked afterwards the trigger event
    if (untilTs > 0) {
      filteredLocations = locations.filter(loc => loc.timestamp <= untilTs)
    } else {
      filteredLocations = locations
    }
    if (filteredLocations.length < locations.length) {
      Log('Locations filtered: ' + filteredLocations.length - locations.length)
    }

    let user = await getOrCreateId()
    Log('Using Id: ' + user)

    try {
      await smartSend(filteredLocations, user, { force })
      await storeFlagFailUpload(false)
      return true
    } catch (message) {
      Log('Error trying to send data: ' + message)
      await storeFlagFailUpload(true)
      return false
    }
  } catch (error) {
    throw new Error(error)
  }
}
