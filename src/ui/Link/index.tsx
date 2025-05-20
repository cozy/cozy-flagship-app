import React from 'react'
import { Pressable, PressableProps } from 'react-native'

type LinkProps = PressableProps

export const Link = ({
  children,
  disabled,
  onPress,
  ...props
}: LinkProps): JSX.Element => (
  <Pressable onPress={onPress} disabled={disabled} {...props}>
    {children}
  </Pressable>
)
