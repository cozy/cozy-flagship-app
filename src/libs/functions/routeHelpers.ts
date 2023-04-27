import {
  NavigationProp,
  ParamListBase,
  RouteProp
} from '@react-navigation/native'
import { get } from 'lodash'

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
