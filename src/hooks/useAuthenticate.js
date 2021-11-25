import {useEffect, useState} from 'react'

import strings from '../strings.json'
import {callInitClient} from '../libs/client'

const isLoginUrl = (url) => new URL(url).pathname === strings.loginPathname

export const useAuthenticate = (navigation, setClient) => {
  const [uri, setUri] = useState(strings.emptyString)

  const onShouldStartLoadWithRequest = ({url}) => {
    if (isLoginUrl(url)) {
      setUri(url)
      return false
    }

    return true
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
