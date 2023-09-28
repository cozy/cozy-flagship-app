import Minilog from 'cozy-minilog'
import {
  NavigationProp,
  ParamListBase,
  RouteProp
} from '@react-navigation/native'
import { get } from 'lodash'
import { useEffect, useState } from 'react'

const log = Minilog('routeHelpers')

/**
 * Retrieve the specified route parameter and remove it from the navigation state
 * @param {string} paramName - Name of the parameter to retrieve
 * @param {*} route - Application's route
 * @param {*} navigation - Application's navigation
 * @returns the route parameter's value
 */
export const consumeRouteParameter = <T>(
  paramName: string,
  route: RouteProp<ParamListBase>,
  navigation: NavigationProp<ParamListBase>
): T | undefined => {
  const param = get(route, `params.${paramName}`) as T | undefined

  if (param !== undefined) {
    navigation.setParams({ [paramName]: undefined })
  }

  return param
}

interface UseClouderyUrlHook<T> {
  consume: () => T | undefined
}

/**
 * Hook that return the specified route parameter and ensure it is read only one single time
 *
 * @param paramName - Name of the parameter to retrieve
 * @param route - Application's route
 * @param navigation - Application's navigation
 * @returns an initial parameter to be `.consume()`
 */
export const useInitialParam = <T>(
  paramName: string,
  route: RouteProp<ParamListBase>,
  navigation: NavigationProp<ParamListBase>
): UseClouderyUrlHook<T> => {
  const [paramValue, setParamValue] = useState<T | undefined>(undefined)
  const [handledInitialParams, setHandledInitialParams] = useState(false)

  const consume = (): T | undefined => {
    const value = paramValue

    setParamValue(undefined)

    return value
  }

  useEffect(
    function checkInitialParam() {
      const value = consumeRouteParameter<T>(paramName, route, navigation)

      if (handledInitialParams) {
        if (value) {
          log.debug(
            `🚨 useInitialParam detected new value for already consumed ${paramName} param, this should not happens, please verify your Router initialization`
          )
        }
        return
      }

      setParamValue(value)

      setHandledInitialParams(true)
    },
    [handledInitialParams, navigation, paramName, paramValue, route]
  )

  return { consume }
}
