import React, { useState } from 'react'
import { View, Image, StyleSheet } from 'react-native'

import { ConfirmDialog } from '/ui/CozyDialogs/ConfirmDialog'
import { Typography } from '/ui/Typography'
import { Button } from '/ui/Button'
import COZY_ICON from '/assets/appIcons/cozy.png'
import MESPAPIERS_ICON from '/assets/appIcons/mespapiers.png'
import MABULLE_ICON from '/assets/appIcons/mabulle.png'
import { translation } from '/locales'

// eslint-disable-next-line
export let toggleIconChangedModal = (newIcon: string): void => {}

interface IconProps {
  icon: string
}

const styles = StyleSheet.create({
  icon: {
    width: 64,
    height: 64
  },
  description: { marginTop: 16, textAlign: 'center' },
  headerStyle: { marginBottom: 6 },
  contentWrapper: { display: 'flex', alignItems: 'center' }
})

const Icon = ({ icon }: IconProps): JSX.Element => {
  if (icon === 'mespapiers')
    return (
      <Image source={MESPAPIERS_ICON} style={styles.icon} resizeMode="center" />
    )
  if (icon === 'mabulle')
    return (
      <Image source={MABULLE_ICON} style={styles.icon} resizeMode="center" />
    )

  return <Image source={COZY_ICON} style={styles.icon} resizeMode="center" />
}

export const IconChangedModal = (): JSX.Element | null => {
  const [show, setShow] = useState(false)
  const [icon, setIcon] = useState('')

  toggleIconChangedModal = (newIcon: string): void => {
    setIcon(newIcon)
    setShow(true)
  }

  return show ? (
    <ConfirmDialog
      content={
        <View style={styles.contentWrapper}>
          <Icon icon={icon} />
          <Typography variant="body1" style={styles.description}>
            {translation.modals.IconChangedModal.description}
          </Typography>
        </View>
      }
      actions={
        <>
          <Button variant="secondary" onPress={(): void => setShow(!show)}>
            <Typography variant="button" color="secondary">
              OK
            </Typography>
          </Button>
        </>
      }
      onClose={(): void => setShow(!show)}
      headerStyle={styles.headerStyle}
    />
  ) : null
}
