import React, { useCallback, useEffect } from 'react'
import RNBootSplash from 'react-native-bootsplash'

import { Button } from '/ui/Button'
import { Container } from '/ui/Container'
import { CozyTheme, CozyThemeVariant } from '/ui/CozyTheme/CozyTheme'
import { Grid } from '/ui/Grid'

export const StoryWrapper = (Story: () => JSX.Element): JSX.Element => {
  const [variant, setVariant] = React.useState<CozyThemeVariant>('normal')
  const setVariantOpposite = useCallback(
    () => setVariant(variant === 'normal' ? 'inverted' : 'normal'),
    [variant]
  )

  useEffect(() => void RNBootSplash.hide(), [])

  return (
    <CozyTheme variant={variant}>
      <Container>
        <Grid container direction="column" justifyContent="space-between">
          <Grid>
            <Button
              variant="primary"
              onPress={setVariantOpposite}
              label="Switch theme"
              style={{ marginBottom: 16 }}
            />
          </Grid>

          <Grid
            alignItems="center"
            justifyContent="center"
            style={{ flexGrow: 1 }}
          >
            <Story />
          </Grid>
        </Grid>
      </Container>
    </CozyTheme>
  )
}
