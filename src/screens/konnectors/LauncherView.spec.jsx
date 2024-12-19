import { toHaveStyle } from '@testing-library/jest-native'
import { render, act, waitFor } from '@testing-library/react-native'
import MicroEE from 'microee'
import React from 'react'

import { LauncherView } from './LauncherView'

jest.mock('@fengweichong/react-native-gzip', () => {
  return {}
})

jest.mock('cozy-client', () => ({
  ...jest.requireActual('cozy-client'),
  withClient: jest.fn().mockReturnValue({})
}))

jest.mock('/screens/konnectors/core/handleTimeout')

describe('LauncherView', () => {
  expect.extend({ toHaveStyle })
  jest.setTimeout(15000)
  function setup() {
    const launcherContext = {
      konnector: {
        slug: 'testkonnectorslug'
      }
    }
    const setLauncherContext = jest.fn()
    const launcherClient = {}
    const client = {}
    const retry = jest.fn()
    const onKonnectorJobUpdate = jest.fn()
    const onKonnectorLog = jest.fn()

    function Launcher() {}
    MicroEE.mixin(Launcher)
    const launcher = new Launcher()
    launcher.waitForWorkerVisible = jest.fn()
    launcher.setLogger = jest.fn()
    launcher.start = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        launcher.on('stop', () => {
          resolve()
        })
      })
    })
    launcher.close = jest.fn()
    launcher.init = jest.fn()
    launcher.log = jest.fn()
    launcher.setStartContext = jest.fn()
    launcher.ensureKonnectorIsInstalled = jest.fn().mockResolvedValue({})

    const root = render(
      <LauncherView
        launcher={launcher}
        client={client}
        launcherClient={launcherClient}
        launcherContext={launcherContext}
        retry={retry}
        setLauncherContext={setLauncherContext}
        onKonnectorLog={onKonnectorLog}
        onKonnectorJobUpdate={onKonnectorJobUpdate}
      />
    )
    return { root, launcher }
  }
  it('should hide worker webview by default', async () => {
    const { root, launcher } = setup()

    await waitFor(
      () => {
        expect(root.queryByTestId('workerView')).not.toBe(null)
      },
      { timeout: 10000 } // 5s was not enough on travis side. I don't know why
    )
    const hiddenStyle = {
      top: -2000
    }
    expect(root.queryByTestId('workerView')).toHaveStyle(hiddenStyle)
    act(() => {
      launcher.emit('stop')
    })
  })

  it('should show the worker on SET_WORKER_STATE visible event', async () => {
    const { root, launcher } = setup()

    await waitFor(
      () => {
        expect(root.queryByTestId('workerView')).not.toBe(null)
      },
      { timeout: 10000 }
    )
    const visibleStyle = {
      height: '100%'
    }
    const hiddenStyle = {
      top: -2000
    }
    expect(root.queryByTestId('workerView')).toHaveStyle(hiddenStyle)

    act(() => {
      launcher.emit('SET_WORKER_STATE', { visible: true })
    })
    expect(root.queryByTestId('workerView')).toHaveStyle(visibleStyle)
    act(() => {
      launcher.emit('stop')
    })
  })
  it('should show worker interaction blocker on BLOCK_WORKER_INTERACTIONS event', async () => {
    const { root, launcher } = setup()

    await waitFor(
      () => {
        expect(root.queryByTestId('workerView')).not.toBe(null)
      },
      { timeout: 10000 }
    )
    const visibleStyle = {
      height: '100%'
    }
    act(() => {
      launcher.emit('SET_WORKER_STATE', { visible: true })
      launcher.emit('SET_WORKER_STATE', { visible: true })
    })
    expect(root.getByTestId('workerView')).toHaveStyle(visibleStyle)

    const workerInteractionBlockBefore = await root.queryByTestId(
      'workerInteractionBlocker'
    )
    expect(workerInteractionBlockBefore).toBe(null)

    act(() => {
      launcher.emit('BLOCK_WORKER_INTERACTIONS')
    })

    await waitFor(
      () => {
        expect(root.queryByTestId('workerInteractionBlocker')).not.toBe(null)
      },
      { timeout: 10000 }
    )

    act(() => {
      launcher.emit('UNBLOCK_WORKER_INTERACTIONS')
    })

    const workerInteractionBlockAfter = root.queryByTestId(
      'workerInteractionBlocker'
    )
    expect(workerInteractionBlockAfter).toBe(null)

    act(() => {
      launcher.emit('stop')
    })
  })
})
