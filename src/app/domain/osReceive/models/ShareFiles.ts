import type CozyClient from 'cozy-client'

export interface ShareFilesDependencies {
  showOverlay: (message?: string) => void
  hideOverlay: () => void
  handleError: (message: string) => void
  t: (key: string, opts?: Record<string, unknown>) => string
  client: CozyClient | null
}

export type ShareFilesPayload = string[]

export type ShareFilesIntent = (filesIds: ShareFilesPayload) => Promise<void>
