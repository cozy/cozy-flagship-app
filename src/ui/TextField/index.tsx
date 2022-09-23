import React from 'react'
import { TextInput, TextInputProps, View } from 'react-native'

import { Typography } from '/ui/Typography'
import { styles } from '/ui/TextField/styles'

interface TextFieldProps extends TextInputProps {
  cursorColor?: string
  label?: string
  variant?: 'outlined'
  endAdornment?: React.ReactNode
}

export const TextField = ({
  label,
  style,
  endAdornment,
  ...props
}: TextFieldProps): JSX.Element => (
  <View style={[styles.textField, style]}>
    <Typography color="secondary" style={styles.label}>
      {label}
    </Typography>

    <TextInput
      cursorColor={styles.input.color}
      style={styles.input}
      {...props}
    />

    {endAdornment ? (
      <View style={styles.endAdornment}>{endAdornment}</View>
    ) : null}
  </View>
)
