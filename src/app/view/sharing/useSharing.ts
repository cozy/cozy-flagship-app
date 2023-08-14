import { getFilesToUpload } from '/app/domain/sharing/SharingService'

export const useSharingMode = (): {
  filesToUpload: Record<string, unknown>[]
} => {
  return {
    filesToUpload: getFilesToUpload()
  }
}
