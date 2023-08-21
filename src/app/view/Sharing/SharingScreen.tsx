import React from 'react'

import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Typography } from '/ui/Typography'
import { useSharingState } from '/app/view/Sharing/SharingState'

export const SharingScreen = (): JSX.Element => {
  const { filesToUpload } = useSharingState()

  return (
    <Container>
      <Grid>
        {filesToUpload.length > 0 ? (
          filesToUpload.map((file, index) => (
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
