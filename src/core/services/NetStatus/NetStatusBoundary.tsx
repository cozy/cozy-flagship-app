import NetInfo from '@react-native-community/netinfo'
import React, { ReactNode, useEffect, useRef, useState } from 'react'

import { ErrorScreen } from '/screens/error/ErrorScreen'
import { useSplashScreen } from '/hooks/useSplashScreen'

interface Props {
  children: ReactNode
  offlineScreen?: JSX.Element
}

const NetStatusBoundary = ({
  children,
  offlineScreen
}: Props): JSX.Element | null => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const subscription = useRef<ReturnType<typeof NetInfo.addEventListener>>()
  const { hideSplashScreen } = useSplashScreen()

  useEffect(() => {
    const main = async (): Promise<void> => {
      const state = await NetInfo.fetch()

      if (state.isConnected) setIsConnected(true)
      else {
        setIsConnected(false)

        await hideSplashScreen()

        subscription.current = NetInfo.addEventListener(state => {
          if (state.isConnected) {
            setIsConnected(true)
          }
        })
      }
    }

    void main()

    return () => subscription.current?.()
  }, [hideSplashScreen])

  if (isConnected === null) return null

  return isConnected
    ? (children as JSX.Element)
    : offlineScreen ?? <ErrorScreen route={{ params: { type: 'offline' } }} />
}

export default NetStatusBoundary
