import React from 'react'
import { useState } from 'react'

import CozyClient from 'cozy-client'
import Minilog from '@cozy/minilog'
const konnLog = Minilog('Konnector')

import { LauncherContext } from '/libs/connectors/models'
import { useLauncherWrapper } from '/screens/home/hooks/useLauncherWrapper'
import { ErrorParallelConnectors } from '/screens/home/components/ErrorParallelConnectors'
import { useConnectors } from '/hooks/useConnectors'
import { LogObj } from '/redux/ConnectorState/ConnectorLogsSlice'

interface useLauncherContextReturn {
  LauncherDialog: JSX.Element | null
  canDisplayLauncher: () => boolean
  concurrentConnector?: string
  launcherClient?: CozyClient
  launcherContext: LauncherContext
  onKonnectorLog: (logObj: LogObj) => void
  resetLauncherContext: () => void
  setConcurrentConnector: (connectorSlug?: string) => void
  setLauncherContext: (candidateContext: LauncherContext) => void
  trySetLauncherContext: (candidateContext: LauncherContext) => void
}

export const useLauncherContext = (): useLauncherContextReturn => {
  const [launcherContext, setLauncherContext] = useState<LauncherContext>({
    state: 'default'
  })
  const { canDisplayLauncher, launcherClient } =
    useLauncherWrapper(launcherContext)
  const [concurrentConnector, setConcurrentConnector] = useState<string>()
  const { addLog } = useConnectors()

  const onKonnectorLog = (logObj: LogObj): void => {
    const level = logObj.level
    if (level in konnLog) {
      const key = level as keyof MiniLogger
      konnLog[key](`${logObj.slug}: ${logObj.msg}`)
    }
    addLog(logObj)
  }

  const trySetLauncherContext = (candidateContext: LauncherContext): void => {
    if (launcherContext.value && candidateContext.value)
      return setConcurrentConnector(candidateContext.value.connector.slug)

    setLauncherContext(candidateContext)
  }

  const resetLauncherContext = (): void => {
    setLauncherContext({ state: 'default' })
  }

  return {
    canDisplayLauncher,
    concurrentConnector,
    launcherClient,
    launcherContext,
    LauncherDialog:
      launcherContext.value && concurrentConnector ? (
        <ErrorParallelConnectors
          currentRunningConnector={launcherContext.value.connector.slug}
          concurrentConnector={concurrentConnector}
          onClose={(): void => setConcurrentConnector(undefined)}
        />
      ) : null,
    resetLauncherContext,
    setConcurrentConnector,
    setLauncherContext,
    trySetLauncherContext,
    onKonnectorLog
  }
}
