import { FlagshipUI } from 'cozy-intent'
import Minilog from 'cozy-minilog'

import { EventEmitter } from 'events'

import { ScreenIndexes } from '/app/view/FlagshipUI/ScreenIndexes'
import { applyFlagshipUI } from '/libs/intents/setFlagshipUI'

const log = Minilog('🖌️ FlagshipUIService')

const DEBUG = false

function doLogDebug(...args: unknown[]): void {
  if (DEBUG) {
    log.debug(args)
  }
}

export const flagshipUIEventHandler = new EventEmitter()

export const flagshipUIEvents = {
  REGISTER_COMPONENT: 'REGISTER_COMPONENT',
  UNREGISTER_COMPONENT: 'UNREGISTER_COMPONENT',
  SET_COMPONENT_COLORS: 'SET_COMPONENT_COLORS',
  UPDATED_COMPONENT: 'UPDATED_COMPONENT'
}

interface SettedUI {
  id: string
  ui: FlagshipUI | undefined
  zIndex: number
}

interface FlagshipState {
  state: SettedUI[]
}

export interface FlagshipUiUpdateEvent {
  id: string
  ui: FlagshipUI | undefined
}

export const flagshipState: FlagshipState = {
  state: [
    // We insert Splashscreen as a special entry as SplashScreen is handled ouside of React
    {
      id: 'Splashscreen',
      ui: {
        topTheme: 'light',
        bottomTheme: 'light'
      },
      zIndex: ScreenIndexes.SPLASH_SCREEN
    }
  ]
}

export const DEFAULT_FLAGSHIP_UI: FlagshipUI = {
  topTheme: 'light',
  bottomTheme: 'light'
}

const renderFlagshipUiRecursive = (remaining: SettedUI[]): void => {
  const last = remaining[0]

  // Disabling false positive
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (last?.ui) {
    doLogDebug('Update Flagship UI', last.ui, last.id)
    applyFlagshipUI(last.ui, last.id)
  } else if (remaining.length > 1) {
    renderFlagshipUiRecursive(remaining.slice(1))
  } else {
    doLogDebug('Update Flagship UI with default')
    applyFlagshipUI(DEFAULT_FLAGSHIP_UI, 'default')
  }
}

const renderFlagshipUI = (): void => {
  const sorted = [...flagshipState.state].sort((a, b) => {
    return b.zIndex - a.zIndex
  })

  renderFlagshipUiRecursive(sorted)
}

const registerService = (): void => {
  const registerComponent = (
    id: string,
    zIndex: number,
    defaultUi?: FlagshipUI
  ): void => {
    doLogDebug(`🟢 Register component ${id}`)
    if (!flagshipState.state.some(val => val.id === id)) {
      flagshipState.state.push({
        id,
        ui: defaultUi ? defaultUi : undefined,
        zIndex
      })
      if (defaultUi) {
        flagshipUIEventHandler.emit(flagshipUIEvents.UPDATED_COMPONENT, {
          id: id,
          ui: defaultUi
        })
      }
    }
    renderFlagshipUI()
  }

  const unregisterComponent = (id: string): void => {
    doLogDebug(`🔴 Unregister component ${id}`)

    flagshipState.state = flagshipState.state.filter(o => o.id !== id)
    renderFlagshipUI()
  }

  const setColor = (id: string, ui: FlagshipUI | undefined): void => {
    doLogDebug(`🟠 Update component's color for ${id}`)

    const component = flagshipState.state.find(o => o.id === id)

    if (component) {
      if (ui === undefined) {
        component.ui = undefined
      } else {
        component.ui = {
          ...component.ui,
          ...ui
        }
      }

      flagshipUIEventHandler.emit(flagshipUIEvents.UPDATED_COMPONENT, {
        id: id,
        ui: component.ui
      })
    }

    renderFlagshipUI()
  }

  flagshipUIEventHandler.addListener(
    flagshipUIEvents.REGISTER_COMPONENT,
    registerComponent
  )

  flagshipUIEventHandler.addListener(
    flagshipUIEvents.UNREGISTER_COMPONENT,
    unregisterComponent
  )

  flagshipUIEventHandler.addListener(
    flagshipUIEvents.SET_COMPONENT_COLORS,
    setColor
  )

  renderFlagshipUI()
}

export const initFlagshipUIService = (): void => {
  registerService()
}
