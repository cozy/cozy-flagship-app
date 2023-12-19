import { Route, useNavigationState } from '@react-navigation/native'
import {
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef
} from 'react'

import { generateWebLink, useClient } from 'cozy-client'

import {
  useFilesToUpload,
  useAppsForUpload,
  useOsReceiveDispatch
} from '/app/view/OsReceive/state/OsReceiveState'
import {
  OsReceiveActionType,
  OsReceiveFileStatus
} from '/app/domain/osReceive/models/OsReceiveState'
import { CozyAppParams } from '/constants/route-types'
import { routes } from '/constants/routes'
import { useDefaultIconParams } from '/libs/functions/openApp'
import { navigate, navigationRef } from '/libs/RootNavigation'

export const useOsReceiveScreenLogic = (): {
  selectedOption: string | undefined
  setSelectedOption: Dispatch<SetStateAction<string | undefined>>
  canProceed: () => boolean
  proceedToWebview: () => void
  hasAppsForUpload: () => boolean
} => {
  const [selectedOption, setSelectedOption] = useState<string>()
  const filesToUpload = useFilesToUpload()
  const appsForUpload = useAppsForUpload()
  const osReceiveDispatch = useOsReceiveDispatch()
  const iconParams = useDefaultIconParams()
  const client = useClient()
  const hasAppsForUpload = useCallback(
    (): boolean => Boolean(appsForUpload?.find(app => !app.reasonDisabled)),
    [appsForUpload]
  )
  const currentRouteRef = useRef<Route<string, CozyAppParams>>()
  const navigationState = useNavigationState(state => state)

  // Store the current route if it's cozyapp to be able to go back to it
  useEffect(() => {
    const currentRoute = navigationRef.getCurrentRoute() as Route<
      string,
      CozyAppParams
    >

    if (currentRoute.name === routes.cozyapp) {
      currentRouteRef.current = currentRoute
    } else {
      currentRouteRef.current = undefined
    }
  }, [navigationState])

  const canProceed = useCallback(
    () => !(filesToUpload.length > 0),
    [filesToUpload]
  )

  const proceedToWebview = useCallback(() => {
    if (!client) throw new Error('Client is not defined')
    if (!appsForUpload) throw new Error('Apps for upload are not defined')

    // No selected option means that we couldn't auto-select any app,
    // Meaning every app is disabled or there are no apps
    if (!selectedOption)
      return osReceiveDispatch({
        type: OsReceiveActionType.SetInitialState
      })

    const app = appsForUpload.find(app => app.slug === selectedOption)

    if (!app) throw new Error('App is not defined')

    const webLink = generateWebLink({
      cozyUrl: client.getStackClient().uri,
      pathname: '',
      slug: selectedOption,
      subDomainType: client.capabilities.flat_subdomains ? 'flat' : 'nested',
      hash: app.routeToUpload.replace(/^\/?#?\//, ''),
      searchParams: []
    })

    navigate(routes.cozyapp, {
      href: webLink,
      slug: selectedOption,
      iconParams
    })

    osReceiveDispatch({
      type: OsReceiveActionType.UpdateFileStatus,
      payload: { name: '*', status: OsReceiveFileStatus.queued }
    })

    osReceiveDispatch({
      type: OsReceiveActionType.SetRouteToUpload,
      payload: { href: webLink, slug: selectedOption }
    })
  }, [client, appsForUpload, selectedOption, iconParams, osReceiveDispatch])

  useEffect(() => {
    const firstEnabledApp = appsForUpload?.find(app => !app.reasonDisabled)

    if (firstEnabledApp) {
      setSelectedOption(firstEnabledApp.slug)
    }
  }, [appsForUpload, setSelectedOption])

  return {
    selectedOption,
    setSelectedOption,
    canProceed,
    proceedToWebview,
    hasAppsForUpload
  }
}
