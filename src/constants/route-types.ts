import { ParamListBase } from '@react-navigation/native'

export interface IconParams {
  x: number
  y: number
  width: number
  height: number
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export interface CozyAppParams {
  href: string
  slug: string
  iconParams: IconParams
}

enum RouteNames {
  CozyApp = 'cozyapp'
}

export interface CozyAppRouteParams extends ParamListBase {
  [RouteNames.CozyApp]: CozyAppParams
}

export interface RootStackParamList extends ParamListBase {
  cozyapp: CozyAppParams
}

export const Routes: { [key in RouteNames]: key } = {
  cozyapp: RouteNames.CozyApp
}
