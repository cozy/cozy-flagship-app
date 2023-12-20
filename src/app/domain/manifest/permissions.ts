import { KonnectorsDocument } from 'cozy-client/types/types'

export const hasPermission = (
  konnector: KonnectorsDocument,
  permission: string
): boolean => {
  return Object.values(konnector.permissions ?? []).some(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    perm => perm?.type === permission // Unsafe member access .type on an `any` value
  )
}
