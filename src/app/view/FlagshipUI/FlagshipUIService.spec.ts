import {
  DEFAULT_FLAGSHIP_UI,
  initFlagshipUIService,
  flagshipUIEventHandler,
  flagshipUIEvents,
  flagshipState
} from '/app/view/FlagshipUI'
import { applyFlagshipUI } from '/libs/intents/setFlagshipUI'

jest.mock('/libs/intents/setFlagshipUI', () => ({
  applyFlagshipUI: jest.fn()
}))

describe('FlagshipUIService', () => {
  initFlagshipUIService()

  beforeEach(() => {
    flagshipState.state = []
  })

  describe('REGISTER_COMPONENT', () => {
    it('should add a component to its list and call applyFlagshipUI with default when REGISTER_COMPONENT is called without UI', () => {
      flagshipUIEventHandler.emit(
        flagshipUIEvents.REGISTER_COMPONENT,
        'SOME_COMPONENT_ID',
        12
      )

      expect(applyFlagshipUI).toHaveBeenCalledWith(
        DEFAULT_FLAGSHIP_UI,
        'default'
      )
      expect(flagshipState.state).toStrictEqual([
        {
          id: 'SOME_COMPONENT_ID',
          ui: undefined,
          zIndex: 12
        }
      ])
    })

    it('should add a component to its list and call applyFlagshipUI with previous topmost component if any, when REGISTER_COMPONENT is called without UI', () => {
      flagshipState.state = [
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        },
        {
          id: 'SOME_COMPONENT_3',
          ui: { bottomTheme: 'light' },
          zIndex: 3
        }
      ]

      flagshipUIEventHandler.emit(
        flagshipUIEvents.REGISTER_COMPONENT,
        'SOME_COMPONENT_ID',
        4
      )

      expect(applyFlagshipUI).toHaveBeenCalledWith(
        { bottomTheme: 'light' },
        'SOME_COMPONENT_3'
      )
      expect(flagshipState.state).toStrictEqual([
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        },
        {
          id: 'SOME_COMPONENT_3',
          ui: { bottomTheme: 'light' },
          zIndex: 3
        },
        {
          id: 'SOME_COMPONENT_ID',
          ui: undefined,
          zIndex: 4
        }
      ])
    })

    it('should add a component to its list and call applyFlagshipUI with its UI when REGISTER_COMPONENT is called with UI', () => {
      flagshipUIEventHandler.emit(
        flagshipUIEvents.REGISTER_COMPONENT,
        'SOME_COMPONENT_ID',
        12,
        {
          topTheme: 'light'
        }
      )

      expect(applyFlagshipUI).toHaveBeenCalledWith(
        {
          topTheme: 'light'
        },
        'SOME_COMPONENT_ID'
      )
      expect(flagshipState.state).toStrictEqual([
        {
          id: 'SOME_COMPONENT_ID',
          ui: {
            topTheme: 'light'
          },
          zIndex: 12
        }
      ])
    })

    it('should not add any component when REGISTER_COMPONENT is called on an already existing component, but should call applyFlagshipUI for topmost component', () => {
      flagshipState.state = [
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        },
        {
          id: 'SOME_COMPONENT_3',
          ui: { bottomTheme: 'light' },
          zIndex: 3
        }
      ]

      flagshipUIEventHandler.emit(
        flagshipUIEvents.REGISTER_COMPONENT,
        'SOME_COMPONENT_1',
        12,
        {
          topTheme: 'light'
        }
      )

      expect(applyFlagshipUI).toHaveBeenCalledWith(
        {
          bottomTheme: 'light'
        },
        'SOME_COMPONENT_3'
      )
      expect(flagshipState.state).toStrictEqual([
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        },
        {
          id: 'SOME_COMPONENT_3',
          ui: { bottomTheme: 'light' },
          zIndex: 3
        }
      ])
    })
  })

  describe('UNREGISTER_COMPONENT', () => {
    it('should remove a component and call applyFlagshipUI for topmost component', () => {
      flagshipState.state = [
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        },
        {
          id: 'SOME_COMPONENT_3',
          ui: { bottomTheme: 'light' },
          zIndex: 3
        }
      ]

      flagshipUIEventHandler.emit(
        flagshipUIEvents.UNREGISTER_COMPONENT,
        'SOME_COMPONENT_3'
      )

      expect(applyFlagshipUI).toHaveBeenCalledWith(
        {
          topTheme: 'light'
        },
        'SOME_COMPONENT_2'
      )
      expect(flagshipState.state).toStrictEqual([
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        }
      ])
    })

    it('should not remove anything if component does not exist, but should call applyFlagshipUI for topmost component', () => {
      flagshipState.state = [
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        },
        {
          id: 'SOME_COMPONENT_3',
          ui: { bottomTheme: 'light' },
          zIndex: 3
        }
      ]

      flagshipUIEventHandler.emit(
        flagshipUIEvents.UNREGISTER_COMPONENT,
        'SOME_COMPONENT_4'
      )

      expect(applyFlagshipUI).toHaveBeenCalledWith(
        {
          bottomTheme: 'light'
        },
        'SOME_COMPONENT_3'
      )
      expect(flagshipState.state).toStrictEqual([
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        },
        {
          id: 'SOME_COMPONENT_3',
          ui: { bottomTheme: 'light' },
          zIndex: 3
        }
      ])
    })
  })

  describe('SET_COMPONENT_COLORS', () => {
    it(`should update component's UI and call applyFlagshipUI for topmost component`, () => {
      flagshipState.state = [
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        },
        {
          id: 'SOME_COMPONENT_3',
          ui: { bottomTheme: 'light' },
          zIndex: 3
        }
      ]

      flagshipUIEventHandler.emit(
        flagshipUIEvents.SET_COMPONENT_COLORS,
        'SOME_COMPONENT_3',
        {
          bottomTheme: 'light',
          topTheme: 'light'
        }
      )

      expect(applyFlagshipUI).toHaveBeenCalledWith(
        {
          bottomTheme: 'light',
          topTheme: 'light'
        },
        'SOME_COMPONENT_3'
      )
      expect(flagshipState.state).toStrictEqual([
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        },
        {
          id: 'SOME_COMPONENT_3',
          ui: {
            bottomTheme: 'light',
            topTheme: 'light'
          },
          zIndex: 3
        }
      ])
    })

    it(`should clear component's UI when undefined is passed as parameter`, () => {
      flagshipState.state = [
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        },
        {
          id: 'SOME_COMPONENT_3',
          ui: { bottomTheme: 'light' },
          zIndex: 3
        }
      ]

      flagshipUIEventHandler.emit(
        flagshipUIEvents.SET_COMPONENT_COLORS,
        'SOME_COMPONENT_3',
        undefined
      )

      expect(flagshipState.state).toStrictEqual([
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        },
        {
          id: 'SOME_COMPONENT_3',
          ui: undefined,
          zIndex: 3
        }
      ])
    })

    it(`should merge component's UI when new props are given in params`, () => {
      flagshipState.state = [
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        },
        {
          id: 'SOME_COMPONENT_3',
          ui: { bottomTheme: 'light', topTheme: 'light' },
          zIndex: 3
        }
      ]

      flagshipUIEventHandler.emit(
        flagshipUIEvents.SET_COMPONENT_COLORS,
        'SOME_COMPONENT_3',
        {
          topTheme: 'dark',
          topOverlay: 'transparent'
        }
      )

      expect(flagshipState.state).toStrictEqual([
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        },
        {
          id: 'SOME_COMPONENT_3',
          ui: {
            bottomTheme: 'light',
            topTheme: 'dark',
            topOverlay: 'transparent'
          },
          zIndex: 3
        }
      ])
    })
  })

  describe('UPDATED_COMPONENT', () => {
    it(`should be emited when a component's UI is registered with an UI`, () => {
      const onUpdatedComponent = jest.fn()
      flagshipUIEventHandler.addListener(
        flagshipUIEvents.UPDATED_COMPONENT,
        onUpdatedComponent
      )

      flagshipUIEventHandler.emit(
        flagshipUIEvents.REGISTER_COMPONENT,
        'SOME_COMPONENT_3',
        1,
        {
          bottomTheme: 'dark'
        }
      )

      expect(onUpdatedComponent).toHaveBeenCalledWith({
        id: 'SOME_COMPONENT_3',
        ui: {
          bottomTheme: 'dark'
        }
      })
    })

    it(`should not be emited when a component's UI is registered without an UI`, () => {
      const onUpdatedComponent = jest.fn()
      flagshipUIEventHandler.addListener(
        flagshipUIEvents.UPDATED_COMPONENT,
        onUpdatedComponent
      )

      flagshipUIEventHandler.emit(
        flagshipUIEvents.REGISTER_COMPONENT,
        'SOME_COMPONENT_3',
        1
      )

      expect(onUpdatedComponent).not.toHaveBeenCalled()
    })

    it(`should be emited when a component's UI is modified`, () => {
      flagshipState.state = [
        {
          id: 'SOME_COMPONENT_2',
          ui: { topTheme: 'light' },
          zIndex: 2
        },
        {
          id: 'SOME_COMPONENT_1',
          ui: { topTheme: 'dark' },
          zIndex: 1
        },
        {
          id: 'SOME_COMPONENT_3',
          ui: { bottomTheme: 'light' },
          zIndex: 3
        }
      ]

      const onUpdatedComponent = jest.fn()
      flagshipUIEventHandler.addListener(
        flagshipUIEvents.UPDATED_COMPONENT,
        onUpdatedComponent
      )

      flagshipUIEventHandler.emit(
        flagshipUIEvents.SET_COMPONENT_COLORS,
        'SOME_COMPONENT_3',
        {
          bottomTheme: 'dark'
        }
      )

      expect(onUpdatedComponent).toHaveBeenCalledWith({
        id: 'SOME_COMPONENT_3',
        ui: {
          bottomTheme: 'dark'
        }
      })
    })
  })
})
