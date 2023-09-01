import { useState, useEffect } from 'react'

import { requestNotifications } from '/app/domain/nativePermissions'

interface PermissionsCheckerProps {
  children: JSX.Element
}

export const PermissionsChecker = ({
  children
}: PermissionsCheckerProps): JSX.Element | null => {
  const [notificationPermissionAnswered, setNotificationPermissionAnswered] =
    useState(false)

  useEffect(() => {
    const askNotificationPermission = async (): Promise<void> => {
      await requestNotifications()
      setNotificationPermissionAnswered(true)
    }

    void askNotificationPermission()
  })

  if (notificationPermissionAnswered) {
    return children
  }

  return null
}
