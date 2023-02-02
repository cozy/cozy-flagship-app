import React, { ReactElement } from 'react'
import { Modal, Pressable, StyleProp, View, ViewStyle } from 'react-native'

import { Cross } from '/ui/Icons/Cross'
import { Icon } from '/ui/Icon'
import { IconButton } from '/ui/IconButton'
import { Typography } from '/ui/Typography'
import { styles } from '/ui/CozyDialogs/styles'

interface ConfirmDialogProps {
  actions:
    | ReactElement<{
        children: ReactElement<{ style: StyleProp<ViewStyle> }>[]
      }>
    | ReactElement<{ style: StyleProp<ViewStyle> }>
  content: string
  onClose: () => void
  title: string
}

const renderActions = (
  actions: ConfirmDialogProps['actions']
): ReactElement => {
  if ('children' in actions.props && actions.props.children.length > 0) {
    return (
      <View style={styles.footer}>
        {actions.props.children.map((child, index, array) =>
          React.cloneElement(child, {
            style: {
              ...styles.actions,
              ...(index + 1 === array.length ? styles.actionsLast : {})
            }
          })
        )}
      </View>
    )
  }

  return actions
}

export const ConfirmDialog = ({
  actions,
  content,
  onClose,
  title
}: ConfirmDialogProps): JSX.Element => (
  <Modal onRequestClose={onClose} statusBarTranslucent transparent>
    <Pressable style={styles.dialogContainer} onPress={onClose}>
      <View style={styles.dialog}>
        <View style={styles.header}>
          <Typography variant="h3">{title}</Typography>

          <IconButton onPress={onClose}>
            <Icon icon={Cross} />
          </IconButton>
        </View>

        <View style={styles.content}>
          <Typography>{content}</Typography>
        </View>

        <View style={styles.footer}>{renderActions(actions)}</View>
      </View>
    </Pressable>
  </Modal>
)
