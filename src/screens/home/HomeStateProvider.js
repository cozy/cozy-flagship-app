import React, { createContext, useContext, useState } from 'react'

export const HomeStateContext = createContext(undefined)

export const useHomeStateContext = () => {
  const homeStateContext = useContext(HomeStateContext)

  return homeStateContext
}

export const HomeStateProvider = props => {
  const [shouldWaitCozyApp, setShouldWaitCozyApp] = useState(undefined)

  return (
    <HomeStateContext.Provider
      value={{
        shouldWaitCozyApp,
        setShouldWaitCozyApp
      }}
      {...props}
    />
  )
}
