import React, { ReactNode, useContext, useState } from 'react'

import Minilog from 'cozy-minilog'

export const log = Minilog('🔃 RestartProvider')

interface RestartContextInterface {
  unmountAppForRestart: () => void
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

  const unmount = (): void => {
    log.debug('Unmount app for restart')
    setShouldUnmount(true)
  }

  return (
    <RestartContext.Provider
      value={{
        unmountAppForRestart: unmount
      }}
    >
      {!shouldUnmount ? props.children : null}
    </RestartContext.Provider>
  )
}
