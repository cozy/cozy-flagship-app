import { NetService } from '/libs/services/NetService'

export const isOnline = (): Promise<boolean> => {
  return NetService.isConnected()
}
