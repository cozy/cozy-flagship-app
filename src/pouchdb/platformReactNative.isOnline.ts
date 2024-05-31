import { NetService } from '/libs/services/NetService'

export const isOnline = (): Promise<boolean | null> => {
  return NetService.isConnected()
}
