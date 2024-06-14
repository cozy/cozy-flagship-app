import React, { ReactElement } from 'react'
import { Modal, Pressable, StyleProp, View, ViewStyle } from 'react-native'

import { getColors } from '/ui/colors'
import { Cross } from '/ui/Icons/Cross'
import { Icon } from '/ui/Icon'
import { IconButton } from '/ui/IconButton'
import { Typography } from '/ui/Typography'
import { styles } from '/ui/CozyDialogs/styles'

interface ConfirmDialogProps {
  /**
   * Actions to be displayed in the footer of the dialog. This can be a single React element
   * or an array of elements, typically buttons that the user can interact with.
   */
  actions:
    | ReactElement<{
        children: ReactElement<{ style: StyleProp<ViewStyle> }>[]
      }>
    | ReactElement<{ style: StyleProp<ViewStyle> }>

  /**
   * Content of the dialog. This can be a simple string or a React element for more complex content.
   */
  content: string | ReactElement

  /**
   * A function that will be called when the dialog is requested to be closed. This does not
   * handle the closing itself, which should be controlled by the parent component's state.
   */
  onClose: () => void

  /**
   * Optional title text to be displayed at the top of the dialog.
   */
  title?: string

  /**
   * Optional style or styles to apply to the header component of the dialog. Can be used to
   * customize the appearance of the dialog's header.
   */
  headerStyle?: StyleProp<ViewStyle>

  /**
   * Optional boolean that determines whether the native Modal component should be used.
   * If true, the native Modal will be used (default behaviour); otherwise if false, a custom non-native overlay will be used.
   * This allows for greater flexibility in cases where the native Modal may conflict with other libraries.
   */
  native?: boolean
}

const renderActions = (
  actions: ConfirmDialogProps['actions']
): ReactElement => {
  if ('children' in actions.props && actions.props.children.length > 0) {
    return (
      <View style={styles.footer}>
        {actions.props.children.map((child, index, array) =>
          React.cloneElement(child, {
            key: `ConfirmDialogButton-${index}`,
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

const ModalContent = ({
  onClose,
  title,
  headerStyle,
  content,
  actions
}: Partial<ConfirmDialogProps>): JSX.Element => {
  const colors = getColors()

  return (
    <Pressable style={styles.dialog}>
      <View style={[styles.header, headerStyle]}>
        <Typography variant="h3">{title}</Typography>

        <IconButton onPress={onClose}>
          <Icon icon={Cross} color={colors.primaryTextColor} />
        </IconButton>
      </View>

      <View style={styles.content}>
        {typeof content === 'string' ? (
          <Typography>{content}</Typography>
        ) : (
          content
        )}
      </View>

      <View style={styles.footer}>{actions && renderActions(actions)}</View>
    </Pressable>
  )
}

export const ConfirmDialog = ({
  actions,
  content,
  onClose,
  title,
  headerStyle,
  native = true
}: ConfirmDialogProps): JSX.Element => {
  // The common modal content component
  const modalContent = (
    <View style={styles.overlay}>
      <Pressable style={styles.overlayBackground} onPress={onClose}>
        <View style={styles.dialogContainer}>
          <ModalContent
            onClose={onClose}
            title={title}
            headerStyle={headerStyle}
            content={content}
            actions={actions}
          />
        </View>
      </Pressable>
    </View>
  )

  // Render the native Modal if the `native` prop is true, default behaviour
  if (native) {
    return (
      <Modal onRequestClose={onClose} statusBarTranslucent transparent>
        {modalContent}
      </Modal>
    )
  }

  // Otherwise, render directly the modal content
  // This should be avoided if possible, because it can't guarantee that the modal will be displayed on top of other components
  // (use it if the native modal can't be displayed or can't be seen at all)
  return modalContent
}
