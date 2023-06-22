import IdleTimerManager from 'react-native-idle-timer'

const activateKeepAwake = (tag: string | undefined): void => {
  IdleTimerManager.setIdleTimerDisabled(true, tag)
}

const deactivateKeepAwake = (tag: string | undefined): void => {
  IdleTimerManager.setIdleTimerDisabled(false, tag)
}

export { activateKeepAwake, deactivateKeepAwake }
