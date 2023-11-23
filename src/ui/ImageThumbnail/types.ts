import { StyleProp, ViewStyle } from 'react-native'

export interface ImageThumbnailProps {
  filePath: string
  mimeType: string
  size?: number
  style?: StyleProp<ViewStyle>
}
