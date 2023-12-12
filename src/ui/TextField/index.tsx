import React, { useMemo } from 'react'
import { Platform, TextInput, TextInputProps, View } from 'react-native'
import { MaskInputProps } from 'react-native-mask-input'

import { useCozyTheme } from '/ui/CozyTheme/CozyTheme'
import { TextFieldStyles, styles as computeStyles } from '/ui/TextField/styles'
import { Typography } from '/ui/Typography'

export interface TextFieldProps extends TextInputProps {
  cursorColor?: string
  endAdornment?: React.ReactNode
  inputComponent?:
    | React.ComponentType<TextInputProps>
    | React.ForwardRefExoticComponent<
        MaskInputProps & React.RefAttributes<TextInput>
      >
  label?: string
  inputComponentProps?: Record<string, unknown>
}

export const TextField = ({
  endAdornment,
  inputComponent: InputComponent,
  label,
  style,
  inputComponentProps,
  value = '',
  ...props
}: TextFieldProps): JSX.Element | null => {
  const { colors } = useCozyTheme()
  const styles = useMemo<TextFieldStyles>(() => computeStyles(colors), [colors])

  return (
    <View style={[styles.textField, style]}>
      <Typography color="primary" style={styles.label}>
        {label}
      </Typography>

      {InputComponent ? (
        <InputComponent
          cursorColor={styles.input.color}
          selectionColor={
            Platform.OS === 'ios' ? styles.input.color : undefined
          }
          style={[styles.input, { letterSpacing: 10 }]}
          value={value}
          placeholderTextColor={styles.input.color}
          {...props}
          {...inputComponentProps}
        />
      ) : (
        <TextInput
          cursorColor={styles.input.color}
          selectionColor={
            Platform.OS === 'ios' ? styles.input.color : undefined
          }
          style={styles.input}
          value={value}
          {...props}
        />
      )}

      {endAdornment ? (
        <View style={styles.endAdornment}>{endAdornment}</View>
      ) : null}
    </View>
  )
}
