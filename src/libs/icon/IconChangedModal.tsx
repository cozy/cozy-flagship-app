import React, { useState } from 'react'
import { View, Image, StyleSheet } from 'react-native'

import { ConfirmDialog } from '/ui/CozyDialogs/ConfirmDialog'
import { Typography } from '/ui/Typography'
import { Button } from '/ui/Button'
import BASE_ICON from '/assets/appIcons/base.png'
import MESPAPIERS_ICON from '/assets/appIcons/mespapiers.png'
import { useI18n } from '/locales/i18n'

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
  if (icon === 'mespapiers') {
    return (
      <Image source={MESPAPIERS_ICON} style={styles.icon} resizeMode="center" />
    )
  }

  return <Image source={BASE_ICON} style={styles.icon} resizeMode="center" />
}

export const IconChangedModal = (): JSX.Element | null => {
  const [show, setShow] = useState(false)
  const [icon, setIcon] = useState('')
  const { t } = useI18n()

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
            {t('modals.IconChangedModal.description')}
          </Typography>
        </View>
      }
      actions={
        <>
          <Button
            variant="secondary"
            onPress={(): void => setShow(!show)}
            label="OK"
          />
        </>
      }
      onClose={(): void => setShow(!show)}
      headerStyle={styles.headerStyle}
    />
  ) : null
}
