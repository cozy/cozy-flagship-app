import { useClient } from 'cozy-client'

import React, { useEffect } from 'react'

import { PasswordParams } from '/app/domain/authentication/models/User'
import { getPasswordParams } from '/app/domain/authorization/services/SecurityService'

export const usePasswordService = (): PasswordParams | undefined => {
  const [props, setProps] = React.useState<PasswordParams>()
  const client = useClient()

  useEffect(() => {
    if (client) setProps(getPasswordParams(client))
  }, [client])

  return props
}
