import type CozyClient from 'cozy-client'
import { PostMeMessageOptions } from 'cozy-intent'

export interface ShareFilesDependencies {
  showOverlay: (message?: string) => void
  hideOverlay: () => void
  t: (key: string, opts?: Record<string, unknown>) => string
  client: CozyClient | null
}

export type ShareFilesPayload = string[]

export type ShareFilesIntent = (
  options: PostMeMessageOptions,
  filesIds: ShareFilesPayload
) => Promise<void>
