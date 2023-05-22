import CozyClient from 'cozy-client'

import { isDev } from '/core/tools/env'

// Function types for all the features we need to mock in development mode
type IsDeviceSecuredFn = () => Promise<boolean>
type IsAutoLockEnabledFn = () => Promise<boolean>
type hasDefinedPassword = (client: CozyClient) => Promise<boolean>

// Mapping of function names to function types
interface FunctionSet {
  isDeviceSecured: IsDeviceSecuredFn
  isAutoLockEnabled: IsAutoLockEnabledFn
  hasDefinedPassword: hasDefinedPassword
}

// Same as FunctionSet, but allows functions to be optional
type DevFunctionSet = {
  [K in keyof FunctionSet]?: FunctionSet[K]
}

/**
 * Helper function to assign the right function to the `chosenFns` object.
 * If the application is in development mode and a mock function is defined, it uses the mock function.
 * Otherwise, it uses the production function.
 */
function assignFunction<K extends keyof FunctionSet>(
  chosenFns: Partial<FunctionSet>,
  key: K,
  prodFns: FunctionSet,
  devConfig: DevFunctionSet
): void {
  chosenFns[key] = isDev() && devConfig[key] ? devConfig[key] : prodFns[key]
}

/**
 * Determines which functions to use based on the application mode (development or production)
 * and if a mock function is defined for development mode.
 * It then returns an object that contains the selected functions.
 *
 * @param prodFns - An object that contains the production functions.
 * @param devConfig - An object that contains the mock functions for development mode.
 * @returns An object that contains the functions to be used by the application.
 */
export function getDevModeFunctions(
  prodFns: FunctionSet,
  devConfig: DevFunctionSet
): FunctionSet {
  const chosenFns: Partial<FunctionSet> = {}

  // Iterate over the production functions and decide which function to use
  for (const key in prodFns) {
    assignFunction(chosenFns, key as keyof FunctionSet, prodFns, devConfig)
  }

  // Return the chosen functions
  return chosenFns as FunctionSet
}
