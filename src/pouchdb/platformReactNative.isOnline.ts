import { NetService } from '/libs/services/NetService'

export const isOnline = async (): Promise<boolean> => {
  return (await NetService.isConnected()) ?? true
}
