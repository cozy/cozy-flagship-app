import React from 'react'
import { View, ViewProps } from 'react-native'

import { styles } from './styles'
import { Typography } from '../Typography'
import { Icon } from '../Icon'
import { WarningCircle } from '../Icons/WarningCircle'

interface TooltipProps extends ViewProps {
  title?: string
}

export const Tooltip = ({
  style,
  title,
  children,
  ...props
}: TooltipProps): JSX.Element => (
  <View style={[styles.tooltip, style]} {...props}>
    {children}

    {title ? (
      <View style={styles.label}>
        <Icon style={styles.icon} icon={WarningCircle} />
        <Typography style={styles.text}>{title}</Typography>
      </View>
    ) : null}
  </View>
)
