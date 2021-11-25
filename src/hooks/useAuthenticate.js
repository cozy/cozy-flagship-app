import {useEffect, useState} from 'react'

import strings from '../strings.json'
import {callInitClient} from '../libs/client'

const getFqdn = (url) =>
  new URL(window.decodeURIComponent(url)).searchParams.get(
    strings.loginQueryString,
  )

const handleProtocol = (url) => {
  try {
    return new URL(url).href
  } catch {
    return `${strings.defaultScheme}${url}`
  }
}

export const useAuthenticate = (navigation, setClient) => {
  const [uri, setUri] = useState(strings.emptyString)

  const onShouldStartLoadWithRequest = ({url}) => {
    try {
      setUri(handleProtocol(getFqdn(url)))
      return false
    } catch {
      return true
    }
  }

  useEffect(() => {
    const initClient = async () => {
      try {
        const client = await callInitClient(uri)
        await setClient(client)

        navigation.navigate(strings.home)
      } catch (error) {
        setUri(strings.emptyString)
      }
    }

    uri && initClient()
  }, [uri, setClient, navigation])

  return {onShouldStartLoadWithRequest}
}
