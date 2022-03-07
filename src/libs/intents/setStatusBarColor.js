import {EventEmitter} from 'events'

export const statusBarColorEvent = new EventEmitter()

export const setStatusBarColor = color => {
  statusBarColorEvent.emit('change', color)
}
