export const urlHasKonnectorOpen = (url: string | URL): boolean => {
  try {
    const urlString = typeof url === 'string' ? url : url.toString()
    const urlObject = new URL(
      urlString.endsWith('/') ? urlString.slice(0, -1) : urlString
    )
    const hashArray = urlObject.hash.split('/')
    return hashArray.length >= 3
  } catch {
    return false
  }
}
