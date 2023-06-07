import type {
  RouteProp,
  NavigationContainerRef
} from '@react-navigation/native'
import type { Dispatch, SetStateAction } from 'react'

export interface IconParams {
  x: number
  y: number
  width: number
  height: number
  top: number
  right: number
  bottom: number
  left: number
}

export interface RootStackParamList {
  cozyapp: {
    href: string
    slug: string
    iconParams: IconParams
  }
  [key: string]:
    | undefined
    | { href: string; slug: string; iconParams: IconParams }
}

export interface CozyAppScreenProps {
  route: RouteProp<RootStackParamList, 'cozyapp'>
  navigation: NavigationContainerRef<Record<string, unknown>>
}

export interface CozyAppScreenAnimationProps {
  onFirstHalf: (arg: boolean) => void
  onFinished: Dispatch<SetStateAction<boolean>>
  shouldExit: boolean
  params: { x: number; y: number; width: number; height: number }
  slug: string
}
