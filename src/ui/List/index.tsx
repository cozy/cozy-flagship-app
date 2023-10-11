import React from 'react'
import { TouchableOpacity, View } from 'react-native'

import { ListProps, ListItemProps } from '/ui/List/types'
import { styles } from '/ui/List/styles'

export const List = ({
  children,
  style,
  subheader,
  ...props
}: ListProps): JSX.Element => (
  <>
    {subheader ?? null}

    <View style={[styles.list, style]} {...props}>
      {children}
    </View>
  </>
)

export const ListSubHeader = ({
  children,
  style,
  ...props
}: ListProps): JSX.Element => (
  <View style={[styles.listSubheader, style]} {...props}>
    {children}
  </View>
)

export const ListItem = ({
  button,
  children,
  onClick,
  style,
  ...props
}: ListItemProps): JSX.Element => {
  if (button) {
    return (
      <TouchableOpacity
        onPress={onClick}
        style={[styles.listItem, style]}
        {...props}
      >
        {children}
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.listItem, style]} {...props}>
      {children}
    </View>
  )
}

export const ListItemIcon = ({
  children,
  style,
  ...props
}: ListProps): JSX.Element => (
  <View style={[styles.listItemIcon, style]} {...props}>
    {children}
  </View>
)

export const ListItemText = ({
  children,
  style,
  ...props
}: ListProps): JSX.Element => (
  <View style={[styles.listItemText, style]} {...props}>
    {children}
  </View>
)
