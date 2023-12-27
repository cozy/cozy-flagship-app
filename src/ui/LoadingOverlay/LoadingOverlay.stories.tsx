import React from 'react'

import { StoryWrapper } from '/storybook/StoryWrapper'
import { LoadingOverlay } from '/ui/LoadingOverlay'

const LoadingOverlayMeta = {
  title: 'LoadingOverlay',
  component: LoadingOverlay,
  decorators: [StoryWrapper]
}

export default LoadingOverlayMeta

export const Default = (): JSX.Element => (
  <LoadingOverlay loadingMessage="Loading Overlay" />
)
