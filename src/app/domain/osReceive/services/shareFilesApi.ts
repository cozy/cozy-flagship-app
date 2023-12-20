// Interface allowing the cozy-app to request file sharing.
// The cozy-app sends as an argument an array with the ids of the files in the Cozy to send
export const shareFiles = (files: string[]): void => {
  files.map(file => {
    return { path: '/placeholder/' + file }
  })
}
