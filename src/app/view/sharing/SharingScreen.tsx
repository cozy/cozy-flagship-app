import React, { useEffect } from 'react'

import { Container } from '/ui/Container'
import { Grid } from '/ui/Grid'
import { Typography } from '/ui/Typography'
import { useSharingFiles } from '/app/view/sharing/SharingProvider'
import { sharingLogger } from '/app/domain/sharing/services/SharingService'

export const SharingScreen = (): JSX.Element => {
  const receivedFiles = useSharingFiles()

  useEffect(() => {
    sharingLogger.info('SharingScreen', receivedFiles)
  }, [receivedFiles])

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
