import { default as paletteValues } from './palette.json'

const colors = {
  primaryColor: paletteValues.Primary['600'],
  paperBackgroundColor: paletteValues.Common.white
}

export const getColors = () => {
  return colors
}
