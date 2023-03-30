import React, { createContext, useContext, useState } from 'react'

interface HomeStateContextInterface {
  shouldWaitCozyApp?: boolean
  setShouldWaitCozyApp: (value: boolean) => void
}

export const HomeStateContext = createContext<
  HomeStateContextInterface | undefined
>(undefined)

export const useHomeStateContext = (): HomeStateContextInterface => {
  const homeStateContext = useContext(HomeStateContext)

  if (!homeStateContext) {
    throw new Error(
      'useHomeStateContext has to be used within <HomeStateProvider>'
    )
  }

  return homeStateContext
}

interface Props {
  children: JSX.Element
}

export const HomeStateProvider: React.FC<Props> = ({ children, ...props }) => {
  const [shouldWaitCozyApp, setShouldWaitCozyApp] = useState<
    boolean | undefined
  >(undefined)

  return (
    <HomeStateContext.Provider
      value={{
        shouldWaitCozyApp,
        setShouldWaitCozyApp
      }}
      {...props}
    >
      {children}
    </HomeStateContext.Provider>
  )
}
