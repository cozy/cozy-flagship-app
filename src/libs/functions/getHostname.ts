export const getHostname = nativeEvent => {
  try {
    return new URL(nativeEvent.url).hostname
  } catch {
    return nativeEvent?.url
  }
}
