import CozyClient from 'cozy-client'
import { navigate } from '/libs/RootNavigation'
import { navigateToApp } from '/libs/functions/openApp'
import { navigateFromNotification } from '/libs/notifications/notifications'

jest.mock('/libs/functions/openApp')

describe('navigateFromNotification', () => {
  const client = {
    getInstanceOptions: () => ({ capabilities: { flat_subdomains: false } }),
    getStackClient: () => ({ uri: 'http://alice.mycozy.cloud' })
  } as CozyClient

  it('should navigate to app to generated url', () => {
    // Given
    const notification = {
      data: { pathname: '/', url: 'new', slug: 'contacts' }
    }

    // When
    navigateFromNotification(client, notification)

    // Then
    expect(navigateToApp).toHaveBeenCalledWith({
      navigation: { navigate },
      href: 'http://contacts.alice.mycozy.cloud/#/new',
      slug: 'contacts',
      iconParams: undefined
    })
  })

  it('should do nothing if no data in notification', () => {
    // Given
    const notification = {}

    // When
    navigateFromNotification(client, notification)

    // Then
    expect(navigateToApp).not.toHaveBeenCalled()
  })
})
