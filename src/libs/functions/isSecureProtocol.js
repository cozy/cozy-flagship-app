export const isSecureProtocol = client => {
  const instanceUrl = new URL(client.getStackClient().uri)

  return instanceUrl.protocol === 'https:'
}
