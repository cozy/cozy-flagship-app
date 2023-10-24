/*
type Route = {
  name: string,
  path: string,
  component: React.ComponentType<any>,
  exact?: boolean,
  routes?: Array<Route>
}
*/
export const routes = {
  authenticate: 'authenticate',
  cozyapp: 'cozyapp',
  default: 'default',
  error: 'error',
  home: 'home',
  instanceCreation: 'instanceCreation',
  lock: 'lock',
  manager: 'manager',
  onboarding: 'onboarding',
  promptPassword: 'promptPassword',
  promptPin: 'promptPin',
  securize: 'securize',
  setPassword: 'setPassword',
  setPin: 'setPin',
  osReceive: 'osReceive',
  stack: 'stack',
  welcome: 'welcome'
}
