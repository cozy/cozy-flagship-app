import {navBarColorEvent, setNavBarColor} from './setNavBarColor'

it('emits a color', () => {
  let result

  navBarColorEvent.on('change', color => {
    result = color
  })

  setNavBarColor('red')

  expect(result).toBe('red')
})
