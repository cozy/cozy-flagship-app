import {useEffect, useState} from 'react'

import strings from '../strings.json'
import {callInitClient} from '../libs/client'
import {getUriFromRequest} from '../libs/functions/getUriFromRequest'

export const useAuthenticate = (setClient) => {
  const [uri, setUri] = useState(strings.emptyString)

  const onShouldStartLoadWithRequest = (request) =>
    getUriFromRequest(request)
      ? setUri(getUriFromRequest(request)) && false
      : true

  useEffect(() => {
    const initClient = async () => {
      try {
        const client = await callInitClient(uri)
        await setClient(client)
      } catch (error) {
        setUri(strings.emptyString)
      }
    }

    uri && initClient()
  }, [uri, setClient])

  return {onShouldStartLoadWithRequest}
}
