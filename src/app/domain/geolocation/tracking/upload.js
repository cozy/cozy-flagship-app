import BackgroundGeolocation from 'react-native-background-geolocation'

import { smartSend } from '/app/domain/geolocation/tracking/tracking'
import { getOrCreateId } from '/app/domain/geolocation/tracking/user'
import { Log } from '/app/domain/geolocation/helpers'
import { storeFlagFailUpload } from '/app/domain/geolocation/tracking/storage'
import { utf8ByteSize } from '/app/domain/geolocation/tracking/utils'
import { SERVER_URL } from '/app/domain/geolocation/tracking/consts'

const heavyLogs = false // Log points, motion changes...

export const uploadUserCache = async (content, user) => {
  Log('Uploading content to usercache...')
  const docs = filterBadContent(content)
  const request = {
    user: user,
    phone_to_server: docs
  }

  const body = JSON.stringify(request)

  let response = await fetch(SERVER_URL + '/usercache/put', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: body
  })

  const size = utf8ByteSize(body)
  Log('Request size: ' + size)

  if (heavyLogs) {
    Log('Uploaded: ' + JSON.stringify(request))
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
  }
  Log('Success uploading')
  return { ok: true }
}

export const runOpenPathPipeline = async user => {
  Log('Request to run pipeline')
  const request = {
    user: user
  }
  const body = JSON.stringify(request)
  const response = await fetch(SERVER_URL + '/cozy/run/pipeline', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: body
  })
  if (!response.ok) {
    throw new Error(
      String(
        'Error in pipeline run:',
        response.status,
        response.statusText,
        await response.text()
      )
    )
  }
  return { ok: true }
}

/**
 * Make sure the content is correctly formatted, to prevent
 * upload failures
 * @param {Array<object>} contentToUpload - The docs to upload
 * @returns {Array<object} The filtered content
 */
const filterBadContent = contentToUpload => {
  return contentToUpload.filter(doc => {
    return doc && doc.data && doc.metadata
  })
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
