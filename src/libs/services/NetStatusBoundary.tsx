import type { NetInfoState } from '@react-native-community/netinfo'
import React, { ReactNode, useEffect, useState } from 'react'

import { ErrorScreen } from '/app/view/Error/ErrorScreen'
import { netLogger, NetService } from '/libs/services/NetService'
import { safePromise } from '/utils/safePromise'

interface Props {
  children: ReactNode
  offlineScreen?: JSX.Element
}

const NetStatusBoundary = ({
  children,
  offlineScreen
}: Props): JSX.Element | null => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)

  useEffect(() => {
    const doAppMountCheck = async (): Promise<void> => {
      try {
        const isConnected = await NetService.isConnected()

        if (isConnected) {
          netLogger.info('NetStatusBoundary is connected')
          setIsConnected(true)
        } else {
          netLogger.info(
            'NetStatusBoundary is not connected, waiting for online event and hiding splash screen to show offline screen'
          )
          setIsConnected(false)

          NetService.waitForOnline((state: NetInfoState) => {
            netLogger.info('NetStatusBoundary got online event', state)
            setIsConnected(true)
          })
        }
      } catch (error) {
        netLogger.error(
          'NetStatusBoundary error at startup, could not check if connected. Showing children.',
          error
        )
        setIsConnected(true)
      }
    }

    // Check on app launch if we are connected
    // If we are not connected, we will wait for the online event
    // If we are connected, we will render the children, they will handle further disconnections
    safePromise(doAppMountCheck)()
  }, [])

  if (isConnected === null) return null // wait for app mount check before rendering children

  return isConnected
    ? (children as JSX.Element)
    : offlineScreen ?? <ErrorScreen route={{ params: { type: 'offline' } }} />
}

export default NetStatusBoundary
