import React from 'react'
import { Image, ImageStyle, View } from 'react-native'

import {
  isImageType,
  getImageUri,
  getIconForMimeType
} from '/ui/ImageThumbnail/helpers'
import { Icon } from '/ui/Icon'
import { createImageStyles, createViewStyles } from '/ui/ImageThumbnail/styles'
import { ImageThumbnailProps } from '/ui/ImageThumbnail/types'

/**
 * Displays a thumbnail for a file.
 * Will display an image thumbnail if the file is an image, otherwise will display an icon.
 * Will handle bad/empty file paths and mime types gracefully, but if it gets to that point, there are bigger problems.
 * Since this is just a UI component, it does not handle or correct errors of that nature.
 */
export const FileThumbnail = ({
  filePath = '',
  mimeType = '',
  size = 128,
  style
}: ImageThumbnailProps): JSX.Element => (
  <View style={[createViewStyles(size).view, style]}>
    {isImageType(mimeType) ? (
      <Image
        source={{ uri: getImageUri(filePath) }}
        // Casting to ImageStyle is necessary here to resolve a TypeScript type mismatch.
        // The style object returned by StyleSheet.create includes a union of ViewStyle, TextStyle, and ImageStyle.
        // However, the Image component's style prop specifically expects an ImageStyle.
        // This cast ensures that TypeScript recognizes the style as ImageStyle, aligning with the expected type for the Image component.
        style={createImageStyles(size).image as ImageStyle}
        resizeMode="cover" // Will fill the frame and crop excess parts
      />
    ) : (
      <Icon icon={getIconForMimeType(mimeType)} size={size} />
    )}
  </View>
)
