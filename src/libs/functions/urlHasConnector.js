export const urlHasConnectorOpen = url => {
  try {
    return (
      new URL(url.endsWith('/') ? url.slice(0, -1) : url).hash.split('/')
        .length >= 3
    )
  } catch {
    return false
  }
}
