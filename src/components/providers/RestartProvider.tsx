import React, { ReactNode, useContext, useState } from 'react'
import RNRestart from 'react-native-restart'

import Minilog from 'cozy-minilog'

import { showSplashScreen } from '/app/theme/SplashScreenService'

export const log = Minilog('🔃 RestartProvider')

interface RestartContextInterface {
  restartApp: () => Promise<void>
}

const RestartContext = React.createContext<RestartContextInterface | undefined>(
  undefined
)

export const useRestartContext = (): RestartContextInterface => {
  const restartContext = useContext(RestartContext)

  if (!restartContext) {
    throw new Error(
      'useHomeStateContext has to be used within <HomeStateProvider>'
    )
  }

  return restartContext
}

interface Props {
  children: JSX.Element
}

export const RestartProvider: React.FC<Props> = (props: {
  children: ReactNode
}): JSX.Element => {
  const [shouldUnmount, setShouldUnmount] = useState<boolean>(false)

  const unmountAndRestart = async (): Promise<void> => {
    log.debug('Unmount app for restart')
    await showSplashScreen()
    setShouldUnmount(true)
    RNRestart.Restart()
  }

  return (
    <RestartContext.Provider
      value={{
        restartApp: unmountAndRestart
      }}
    >
      {!shouldUnmount ? props.children : null}
    </RestartContext.Provider>
  )
}
