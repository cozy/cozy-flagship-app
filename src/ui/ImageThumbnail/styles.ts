import { StyleSheet, ViewStyle, ImageStyle } from 'react-native'

const borderRadius = 8

export const createViewStyles = (
  size: number
): StyleSheet.NamedStyles<{ view: ViewStyle }> =>
  StyleSheet.create({
    view: {
      width: size,
      height: size,
      overflow: 'hidden'
    }
  })

export const createImageStyles = (
  size: number
): StyleSheet.NamedStyles<{ image: ImageStyle }> =>
  StyleSheet.create({
    image: {
      width: size,
      height: size,
      borderRadius
    }
  })
