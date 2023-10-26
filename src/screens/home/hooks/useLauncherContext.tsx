import React, { createContext, useContext, useState } from 'react'

import CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { useLauncherWrapper } from '/screens/home/hooks/useLauncherWrapper'
import { ErrorParallelKonnectors } from '/screens/home/components/ErrorParallelKonnectors'
import { useKonnectors } from '/hooks/useKonnectors'
import { LogObj } from '/redux/KonnectorState/KonnectorLogsSlice'
import {
  LauncherContext as LauncherContextInterface,
  LauncherContextValue
} from '/libs/konnectors/models'
import { launcherEvent } from '/libs/ReactNativeLauncher'

const konnLog = Minilog('Konnector')

interface useLauncherContextReturn {
  LauncherDialog: JSX.Element | null
  canDisplayLauncher: () => boolean
  concurrentKonnector?: string
  launcherClient?: CozyClient
  launcherContext: LauncherContextInterface
  onKonnectorLog: (logObj: LogObj) => void
  onKonnectorJobUpdate: (jobId: string | undefined) => void
  resetLauncherContext: () => void
  setConcurrentKonnector: (konnectorSlug?: string) => void
  setLauncherContext: (candidateContext: LauncherContextInterface) => void
  trySetLauncherContext: (candidateContext: LauncherContextInterface) => void
  tryHandleLauncherMessage: (
    payload: { nativeEvent: { data: string } } | undefined
  ) => void
}

export const LauncherContext = createContext<
  useLauncherContextReturn | undefined
>(undefined)

export const useLauncherContext = (): useLauncherContextReturn => {
  const launcherContext = useContext(LauncherContext)
  if (!launcherContext) {
    throw new Error(
      'useLauncherContext has to be used within <LauncherContextProvider>'
    )
  }

  return launcherContext
}

interface Props {
  children: JSX.Element
}

export const LauncherContextProvider: React.FC<Props> = ({
  children,
  ...props
}) => {
  const [launcherContext, setLauncherContext] =
    useState<LauncherContextInterface>({
      state: 'default'
    })
  const { canDisplayLauncher, launcherClient } =
    useLauncherWrapper(launcherContext)
  const [concurrentKonnector, setConcurrentKonnector] = useState<string>()
  const { addLog, setCurrentRunningKonnectorJobId } = useKonnectors()

  const onKonnectorLog = (logObj: LogObj): void => {
    const level = logObj.level
    if (level in konnLog) {
      const key = level as keyof MiniLogger
      konnLog[key](`${logObj.slug}: ${logObj.msg}`)
    }
    addLog(logObj)
  }

  const onKonnectorJobUpdate = (jobId: string | undefined): void => {
    setCurrentRunningKonnectorJobId(jobId)
  }

  const trySetLauncherContext = (
    candidateContext: LauncherContextInterface
  ): void => {
    if (launcherContext.value && candidateContext.value)
      return setConcurrentKonnector(candidateContext.value.konnector.slug)

    setLauncherContext(candidateContext)
  }

  const tryHandleLauncherMessage = (
    payload: { nativeEvent: { data: string } } | undefined
  ): void => {
    const data = payload?.nativeEvent.data
    if (data) {
      const { message, value } = JSON.parse(data) as {
        message: string
        value: LauncherContextValue
      }
      if (message === 'startLauncher') {
        trySetLauncherContext({ state: 'launch', value })
      }
    }
  }

  const resetLauncherContext = (): void => {
    setLauncherContext({ state: 'default' })
  }

  return (
    <LauncherContext.Provider
      value={{
        canDisplayLauncher,
        concurrentKonnector,
        launcherClient,
        launcherContext,
        LauncherDialog:
          launcherContext.value && concurrentKonnector ? (
            <ErrorParallelKonnectors
              currentRunningKonnector={launcherContext.value.konnector.slug}
              concurrentKonnector={concurrentKonnector}
              onClose={(): void => {
                setConcurrentKonnector(undefined)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                launcherEvent.emit('launchResult', { cancel: true })
              }}
            />
          ) : null,
        resetLauncherContext,
        setConcurrentKonnector,
        setLauncherContext,
        trySetLauncherContext,
        tryHandleLauncherMessage,
        onKonnectorLog,
        onKonnectorJobUpdate
      }}
      {...props}
    >
      {children}
    </LauncherContext.Provider>
  )
}
