import React from 'react'
import { useState } from 'react'

import CozyClient from 'cozy-client'

import Minilog from '@cozy/minilog'
const konnLog = Minilog('Konnector')

import { LauncherContext } from '/libs/konnectors/models'
import { useLauncherWrapper } from '/screens/home/hooks/useLauncherWrapper'
import { ErrorParallelKonnectors } from '/screens/home/components/ErrorParallelKonnectors'
import { useKonnectors } from '/hooks/useKonnectors'
import { LogObj } from '/redux/KonnectorState/KonnectorLogsSlice'

interface useLauncherContextReturn {
  LauncherDialog: JSX.Element | null
  canDisplayLauncher: () => boolean
  concurrentKonnector?: string
  launcherClient?: CozyClient
  launcherContext: LauncherContext
  onKonnectorLog: (logObj: LogObj) => void
  onKonnectorJobUpdate: (jobId: string | undefined) => void
  resetLauncherContext: () => void
  setConcurrentKonnector: (konnectorSlug?: string) => void
  setLauncherContext: (candidateContext: LauncherContext) => void
  trySetLauncherContext: (candidateContext: LauncherContext) => void
}

export const useLauncherContext = (): useLauncherContextReturn => {
  const [launcherContext, setLauncherContext] = useState<LauncherContext>({
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

  const trySetLauncherContext = (candidateContext: LauncherContext): void => {
    if (launcherContext.value && candidateContext.value)
      return setConcurrentKonnector(candidateContext.value.konnector.slug)

    setLauncherContext(candidateContext)
  }

  const resetLauncherContext = (): void => {
    setLauncherContext({ state: 'default' })
  }

  return {
    canDisplayLauncher,
    concurrentKonnector,
    launcherClient,
    launcherContext,
    LauncherDialog:
      launcherContext.value && concurrentKonnector ? (
        <ErrorParallelKonnectors
          currentRunningKonnector={launcherContext.value.konnector.slug}
          concurrentKonnector={concurrentKonnector}
          onClose={(): void => setConcurrentKonnector(undefined)}
        />
      ) : null,
    resetLauncherContext,
    setConcurrentKonnector,
    setLauncherContext,
    trySetLauncherContext,
    onKonnectorLog,
    onKonnectorJobUpdate
  }
}
