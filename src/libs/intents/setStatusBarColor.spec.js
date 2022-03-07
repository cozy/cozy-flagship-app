import {setStatusBarColor, statusBarColorEvent} from './setStatusBarColor'

it('emits a color', () => {
  let result

  statusBarColorEvent.on('change', color => {
    result = color
  })

  setStatusBarColor('red')

  expect(result).toBe('red')
})
