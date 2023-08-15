import React from 'react'

import { getFilesToUpload } from '/app/domain/sharing/services/SharingService'
import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Typography } from '/ui/Typography'

export const SharingScreen = (): JSX.Element => {
  return (
    <Container>
      <Grid>
        {Array.from(getFilesToUpload()).map(([key, file]) => (
          <Typography key={key} variant="h3">
            <Typography>File: {key}</Typography>
            <Typography>{JSON.stringify(file, null, 2)}</Typography>
          </Typography>
        ))}
      </Grid>
    </Container>
  )
}
