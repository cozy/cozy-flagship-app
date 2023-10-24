import type { NavigationContainerRef, Route } from '@react-navigation/native'
import type { Dispatch, SetStateAction } from 'react'

import { CozyAppParams } from '/constants/route-types'

export interface CozyAppScreenProps {
  route: Route<'cozyapp', CozyAppParams>
  navigation: NavigationContainerRef<Record<string, unknown>>
}

export interface CozyAppScreenAnimationProps {
  onFirstHalf: (arg: boolean) => void
  onFinished: Dispatch<SetStateAction<boolean>>
  shouldExit: boolean
  params: { x: number; y: number; width: number; height: number }
  slug: string
}
