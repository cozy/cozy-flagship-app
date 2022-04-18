import { DefaultTheme } from 'react-native-paper'

export const lightTheme = {
  ...DefaultTheme,
  dark: false,
  background: 'white',
  colors: {
    ...DefaultTheme.colors,
    primary: '#297EF2',
    accent: 'yellow'
  }
}
export const darkTheme = {
  ...DefaultTheme,
  dark: true,
  background: '#297EF2',
  colors: {
    ...DefaultTheme.colors,
    primary: 'white',
    accent: 'yellow'
  }
}
