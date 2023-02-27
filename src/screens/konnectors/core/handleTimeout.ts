import { constants } from '../constants/konnectors-constants'

let timerId: NodeJS.Timeout

const _clearTimeout = (): void => {
  clearTimeout(timerId)
}

export const stopTimeout = (): void => {
  _clearTimeout()
}

export const startTimeout = (onTimeout: () => void): void => {
  timerId = setTimeout(() => {
    onTimeout()
    _clearTimeout()
  }, constants.timeoutDuration)
}
