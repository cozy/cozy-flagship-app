import {EventEmitter} from 'events'

export const navBarColorEvent = new EventEmitter()

export const setNavBarColor = color => {
  navBarColorEvent.emit('change', color)
}
