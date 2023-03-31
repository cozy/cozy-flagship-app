import { Platform, BackHandler } from 'react-native'

interface LauncherView {
  state: { worker: { visible?: boolean } }
  onStopExecution: () => void
}

type Handler = (launcherView?: LauncherView) => boolean | null | undefined

export const stopExecIfVisible: Handler = (launcherView?: LauncherView) => {
  if (launcherView?.state.worker.visible) launcherView.onStopExecution()
  return true
}

export const handleBackPress = (
  launcherView: LauncherView,
  callbacks: Handler[]
): (() => void) => {
  if (Platform.OS !== 'android') return (): void => undefined

  const boundCallbacks = callbacks.map(callback =>
    callback.bind(null, launcherView)
  )

  boundCallbacks.forEach(boundCallback => {
    BackHandler.addEventListener('hardwareBackPress', boundCallback)
  })

  return (): void => {
    boundCallbacks.forEach(boundCallback => {
      BackHandler.removeEventListener('hardwareBackPress', boundCallback)
    })
  }
}
