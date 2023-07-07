import { useState, useEffect } from 'react'

import type { AuthService } from '/app/domain/authentication/services/AuthService'

interface UseRevokedStatus {
  userRevoked: boolean
  userConfirmation: () => void
}

export const useRevokedStatus = ({
  emitter,
  isUserRevoked,
  setUserRevoked
}: typeof AuthService): UseRevokedStatus => {
  const [userRevoked, _setUserRevoked] = useState(isUserRevoked())
  const userConfirmation = (): void => setUserRevoked(false)

  useEffect(() => {
    emitter.on('userRevoked', (): void => _setUserRevoked(isUserRevoked()))
    emitter.on('userLoggedOut', (): void => _setUserRevoked(isUserRevoked()))

    return () => void emitter.removeAllListeners()
  }, [emitter, isUserRevoked, _setUserRevoked])

  return { userRevoked, userConfirmation }
}
