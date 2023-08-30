import CozyClient from 'cozy-client'

import { OsReceiveCozyApp } from '/app/domain/sharing/models/SharingCozyApp'
import { getRouteToUpload } from '/app/domain/sharing/services/SharingNetwork'

describe('getRouteToUpload', () => {
  const mockCozyClient = new CozyClient({
    uri: 'http://cozy.local',
    capabilities: { flat_subdomains: true }
  })

  it('returns empty object if no client is provided', () => {
    const result = getRouteToUpload()
    expect(result).toEqual({})
  })

  it('returns empty object if cozyApps is not an array or empty', () => {
    // @ts-expect-error Testing invalid input
    const result = getRouteToUpload(null, mockCozyClient)
    expect(result).toEqual({})
  })

  it('returns empty object if no matching app is found', () => {
    const cozyApps = [{ slug: 'wrong-app' } as OsReceiveCozyApp]

    const result = getRouteToUpload(cozyApps, mockCozyClient)
    expect(result).toEqual({})
  })

  it('returns the correct href and slug', () => {
    const cozyApps = [
      {
        slug: 'drive',
        accept_documents_from_flagship: {
          route_to_upload: '/upload-route'
        },
        attributes: {
          accept_documents_from_flagship: {
            route_to_upload: '/upload-route'
          }
        }
      } as OsReceiveCozyApp
    ]
    const result = getRouteToUpload(cozyApps, mockCozyClient, 'drive')
    expect(result).toEqual({
      result: {
        href: 'http://cozy-drive.local/#/upload-route',
        slug: 'drive'
      }
    })
  })

  it('handles an error gracefully', () => {
    const brokenClient = new CozyClient({ uri: undefined })
    const cozyApps = [{ slug: 'drive' } as OsReceiveCozyApp]
    const result = getRouteToUpload(cozyApps, brokenClient)
    expect(result).toEqual({ error: 'Error determining route to upload.' })
  })
})
