import React from 'react'

import { StoryWrapper } from '/storybook/StoryWrapper'
import { Typography } from '/ui/Typography'

const TypographyMeta = {
  title: 'Typography',
  component: Typography,
  decorators: [StoryWrapper]
}

export default TypographyMeta

export const Default = (): JSX.Element => (
  <Typography>Default Typography</Typography>
)
