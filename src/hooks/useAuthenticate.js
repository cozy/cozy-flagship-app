import {useEffect, useState} from 'react'

import strings from '../strings.json'
import {callInitClient} from '../libs/client'

export const useAuthenticate = (navigation, setClient) => {
  const [uri, setUri] = useState('')

  useEffect(() => {
    const initClient = async () => {
      try {
        const client = await callInitClient(uri)
        await setClient(client)
        navigation.navigate(strings.home)
      } catch (error) {
        console.log(error)
      }
    }

    uri && initClient()
  }, [uri, setClient, navigation])

  const onShouldStartLoadWithRequest = ({url}) => {
    if (
      [strings.remind, strings.onboard].some((pathname) =>
        url.includes(pathname),
      )
    ) {
      return true
    }

    setUri(url)

    return false
  }

  return {onShouldStartLoadWithRequest}
}
