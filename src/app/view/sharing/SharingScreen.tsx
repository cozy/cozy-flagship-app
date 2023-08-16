import React, { useEffect } from 'react'

import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Typography } from '/ui/Typography'
import { useSharingFiles } from '/app/view/sharing/SharingProvider'
import { hideSplashScreen } from '/app/theme/SplashScreenService'

export const SharingScreen = (): JSX.Element => {
  const receivedFiles = useSharingFiles()

  useEffect(() => {
    // As the hideSplashScreen function is idempotent, we can call it here for safety purposes,
    // in case the splash screen is still visible for whatever reason (this would be a bug)
    // The splash screen should be hidden either by SecurityService or cozy-home WebView at this point
    void hideSplashScreen()
  }, [])

  return (
    <Container>
      <Grid>
        {receivedFiles.length > 0 ? (
          receivedFiles.map((file, index) => (
            <Typography key={index} variant="h3">
              <Typography>File: {file.fileName}</Typography>
              <Typography>{JSON.stringify(file, null, 2)}</Typography>
            </Typography>
          ))
        ) : (
          <Typography>...loading</Typography>
        )}
      </Grid>
    </Container>
  )
}
