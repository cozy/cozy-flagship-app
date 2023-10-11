import { FlagshipUI } from 'cozy-intent'

import {
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  useEffect
} from 'react'

import { osReceiveScreenStyles } from './OsReceiveScreen.styles'
import {
  useFilesToUpload,
  useAppsForUpload,
  useOsReceiveDispatch
} from './OsReceiveState'

import {
  OsReceiveActionType,
  OsReceiveFileStatus
} from '/app/domain/osReceive/models/OsReceiveState'
import { routes } from '/constants/routes'
import { useDefaultIconParams } from '/libs/functions/openApp'
import { setFlagshipUI } from '/libs/intents/setFlagshipUI'
import { navigate } from '/libs/RootNavigation'

export const useOsReceiveScreenLogic = (): {
  selectedOption: string | undefined
  setSelectedOption: Dispatch<SetStateAction<string | undefined>>
  canProceed: () => boolean
  proceedToWebview: () => void
  onClose: () => void
} => {
  const [selectedOption, setSelectedOption] = useState<string>()
  const filesToUpload = useFilesToUpload()
  const appsForUpload = useAppsForUpload()
  const osReceiveDispatch = useOsReceiveDispatch()
  const iconParams = useDefaultIconParams()

  const canProceed = useCallback(
    () => !(filesToUpload.length > 0),
    [filesToUpload]
  )

  const proceedToWebview = useCallback(() => {
    navigate(routes.cozyapp, {
      href: appsForUpload.find(app => app.slug === selectedOption)
        ?.routeToUpload,
      slug: selectedOption,
      iconParams
    })
    osReceiveDispatch({
      type: OsReceiveActionType.UpdateFileStatus,
      payload: { name: '*', status: OsReceiveFileStatus.queued }
    })
  }, [appsForUpload, iconParams, osReceiveDispatch, selectedOption])

  useEffect(() => {
    void setFlagshipUI(
      osReceiveScreenStyles.setFlagshipUI as FlagshipUI,
      'OsReceiveScreen'
    )
  }, [filesToUpload])

  useEffect(() => {
    const firstEnabledApp = appsForUpload.find(app => !app.reasonDisabled)

    if (firstEnabledApp) {
      setSelectedOption(firstEnabledApp.slug)
    }
  }, [appsForUpload, setSelectedOption])

  return {
    selectedOption,
    setSelectedOption,
    canProceed,
    proceedToWebview,
    onClose: (): void => {
      osReceiveDispatch({
        type: OsReceiveActionType.SetInitialState
      })
    }
  }
}