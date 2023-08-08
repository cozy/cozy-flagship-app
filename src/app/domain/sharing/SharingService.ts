import { Linking } from 'react-native'
import RNFS from 'react-native-fs'
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'

const getQueryParams = url => {
  const queryString = url.split('?')[1]
  const params = queryString.split('&')
  const queryParams = {}
  params.forEach(param => {
    const [key, value] = param.split('=')
    queryParams[key] = decodeURIComponent(value)
  })
  return queryParams
}
const handleOpenURL = async event => {
  console.log('💥Received open url event', event)

  if (!event.url.startsWith('cozy://share')) return

  console.log('💥Received share intent')
  const { type, value } = getQueryParams(event.url)
  const path = value.replace('file://', '')

  if (!(await isFileAtPath(path))) {
    console.error('💥Path does not point to a file')
    return
  }

  const hasPermission = await ensureStoragePermission()
  if (!hasPermission) {
    console.error('💥Permission denied by user')
    return
  }

  try {
    const content = await RNFS.readFile(path, 'utf8') // 'utf8' for text files. If binary, use 'base64'.
    console.log('💥File content:', content)
  } catch (err) {
    console.error('💥Error reading file:', err.message)
  }
}

const isFileAtPath = async path => {
  try {
    const statResult = await RNFS.stat(path)
    return statResult.isFile()
  } catch (err) {
    console.error('💥Exist check error:', err.message)
    return false
  }
}

const ensureStoragePermission = async () => {
  const permissionResult = await check(
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
  )

  if (permissionResult === RESULTS.GRANTED) return true

  const newPermissionResult = await request(
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
  )
  return newPermissionResult === RESULTS.GRANTED
}

export const initializeLinking = async () => {
  try {
    const url = await Linking.getInitialURL()
    if (url?.startsWith('cozy://share')) {
      handleOpenURL({ url })
    }
  } catch (err) {
    console.error('Error retrieving the initial URL:', err)
  }
  Linking.addEventListener('url', handleOpenURL)
}
