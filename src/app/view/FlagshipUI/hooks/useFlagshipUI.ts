import { uniqueId } from 'lodash'
import { useEffect, useState } from 'react'

import { FlagshipUI } from 'cozy-intent'

import {
  flagshipUIEventHandler,
  flagshipUIEvents
} from '/app/view/FlagshipUI/FlagshipUIService'

interface FlagshipUIState {
  componentId: string
  setFlagshipColors: (ui: FlagshipUI) => void
}

export const useFlagshipUI = (
  componentId: string,
  zIndex: number,
  defaultUi?: FlagshipUI
): FlagshipUIState => {
  const [uid] = useState(uniqueId())

  useEffect(() => {
    if (componentId && uid && zIndex) {
      flagshipUIEventHandler.emit(
        flagshipUIEvents.REGISTER_COMPONENT,
        `${componentId}-${uid}`,
        zIndex,
        defaultUi
      )
    }

    return () => {
      flagshipUIEventHandler.emit(
        flagshipUIEvents.UNREGISTER_COMPONENT,
        `${componentId}-${uid}`,
        zIndex
      )
    }
  }, [componentId, zIndex, uid, defaultUi])

  return {
    componentId: `${componentId}-${uid}`,
    setFlagshipColors: (ui: FlagshipUI): void => {
      flagshipUIEventHandler.emit(
        flagshipUIEvents.SET_COMPONENT_COLORS,
        `${componentId}-${uid}`,
        ui
      )
    }
  }
}
