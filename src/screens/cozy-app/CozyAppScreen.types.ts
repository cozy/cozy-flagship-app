import type {
  RouteProp,
  NavigationContainerRef
} from '@react-navigation/native'
import type { Dispatch, SetStateAction } from 'react'

import { CozyAppRouteParams } from '/constants/route-types'
import { routes } from '/constants/routes'

export interface CozyAppScreenProps {
  route: RouteProp<CozyAppRouteParams, typeof routes.cozyapp>
  navigation: NavigationContainerRef<Record<string, unknown>>
}

export interface CozyAppScreenAnimationProps {
  onFirstHalf: (arg: boolean) => void
  onFinished: Dispatch<SetStateAction<boolean>>
  shouldExit: boolean
  params: { x: number; y: number; width: number; height: number }
  slug: string
}
