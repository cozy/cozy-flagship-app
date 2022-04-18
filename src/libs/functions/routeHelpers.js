import { get } from 'lodash'

/**
 * Retrieve the specified route parameter and remove it from the navigation state
 * @param {string} paramName - Name of the parameter to retrieve
 * @param {*} route - Application's route
 * @param {*} navigation - Application's navigation
 * @returns the route parameter's value
 */
export const consumeRouteParameter = (paramName, route, navigation) => {
  const param = get(route, `params.${paramName}`)

  if (param !== undefined) {
    navigation.setParams({ [paramName]: undefined })
  }

  return param
}
