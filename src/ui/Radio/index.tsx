import React from 'react'
import { StyleProp, ViewStyle } from 'react-native'

import { Icon } from '../Icon'
import { RadioChecked } from '../Icons/RadioChecked'
import { RadioUnchecked } from '../Icons/RadioUnchecked'
import { palette } from '../palette'

interface RadioProps {
  checkedIcon?: JSX.Element
  disabled?: boolean
  icon?: JSX.Element
  selected: boolean
  style?: StyleProp<ViewStyle>
}

export const Radio = ({
  selected,
  icon,
  ...props
}: RadioProps): JSX.Element => (
  <Icon
    color={selected ? palette.light.primary.main : palette.light.text.secondary}
    icon={selected ? RadioChecked : RadioUnchecked}
    style={[
      { alignItems: 'center', justifyContent: 'center', minWidth: 32 },
      props.style
    ]}
  />
)
