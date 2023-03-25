import { toHaveStyle } from '@testing-library/jest-native'
import {
  fireEvent,
  render,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@testing-library/react-native'
import React from 'react'
import { Button as MockButton } from 'react-native'

import {
  CLOUDERY_MODE_LOGIN,
  CLOUDERY_MODE_SIGNING
} from '/screens/login/components/ClouderyViewSwitch'
import { useClouderyUrl } from '/screens/login/cloudery-env/useClouderyUrl'

import { ClouderyView } from './ClouderyView'

jest.mock('cozy-client', () => ({
  rootCozyUrl: jest.fn(),
  useClient: jest.fn().mockReturnValue({})
}))

jest.mock('@react-native-cookies/cookies', () => ({
  set: jest.fn()
}))

jest.mock('react-native-webview', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react')
  class WebView extends React.Component {
    render() {
      return (
        <>
          <MockButton
            testID="triggerStartLoadWithRequest"
            onPress={() => {
              const request = {
                loading: true,
                url: this.props.source.uri
              }
              this.props.onShouldStartLoadWithRequest(request)
            }}
            title="WebView Button"
          />
          <MockButton
            testID="triggerOnLoadEnd"
            onPress={() => {
              this.props.onLoadEnd()
            }}
            title="WebView Button onLoadEnd"
          />
        </>
      )
    }
  }

  return { WebView }
})

jest.mock('/screens/login/cloudery-env/useClouderyUrl', () => {
  return {
    useClouderyUrl: jest.fn().mockReturnValue({
      urls: {
        loginUrl:
          'https://loginflagship?fqdn=SOME_EXISTING_INSTANCE.MYCOZY.CLOUD',
        signinUrl: 'https://loginflagship?fqdn=SOME_NEW_INSTANCE.MYCOZY.CLOUD',
        isOnboardingPartner: false
      }
    })
  }
})

describe('ClouderyView', () => {
  describe('on handleNavigation', () => {
    const props = {
      setInstanceData: jest.fn()
    }

    it('should convert instance and FQDN to lowercase', async () => {
      useClouderyUrl.mockReturnValueOnce({
        urls: {
          loginUrl:
            'https://loginflagship?fqdn=SOME_UPPERCASE_INSTANCE.MYCOZY.CLOUD',
          isOnboardingPartner: true
        }
      })

      const { getByTestId } = render(<ClouderyView {...props} />)

      const viewLogin = getByTestId('ViewLogin')
      const button = within(viewLogin).getByTestId(
        'triggerStartLoadWithRequest'
      )

      fireEvent.press(button)

      // Then
      await waitFor(() =>
        expect(props.setInstanceData).toHaveBeenCalledTimes(1)
      )
      expect(props.setInstanceData).toHaveBeenCalledWith({
        instance: 'https://some_uppercase_instance.mycozy.cloud/',
        fqdn: 'some_uppercase_instance.mycozy.cloud'
      })
    })

    it('should listen for redirection and intercept login data for login view', async () => {
      const { getByTestId } = render(<ClouderyView {...props} />)

      const viewLogin = getByTestId('ViewLogin')
      const button = within(viewLogin).getByTestId(
        'triggerStartLoadWithRequest'
      )

      fireEvent.press(button)

      // Then
      await waitFor(() =>
        expect(props.setInstanceData).toHaveBeenCalledTimes(1)
      )
      expect(props.setInstanceData).toHaveBeenCalledWith({
        instance: 'https://some_existing_instance.mycozy.cloud/',
        fqdn: 'some_existing_instance.mycozy.cloud'
      })
    })

    it('should listen for redirection and intercept login data for signin view', async () => {
      const { getByTestId } = render(<ClouderyView {...props} />)

      const viewSignin = getByTestId('ViewSignin')
      const button = within(viewSignin).getByTestId(
        'triggerStartLoadWithRequest'
      )

      fireEvent.press(button)

      // Then
      await waitFor(() =>
        expect(props.setInstanceData).toHaveBeenCalledTimes(1)
      )
      expect(props.setInstanceData).toHaveBeenCalledWith({
        instance: 'https://some_new_instance.mycozy.cloud/',
        fqdn: 'some_new_instance.mycozy.cloud'
      })
    })
  })

  describe('ClouderyViewSwitch', () => {
    expect.extend({ toHaveStyle })

    it('Should display Login view on top of Signin view if CLOUDERY_MODE_LOGIN', async () => {
      const { getByTestId } = render(
        <ClouderyView clouderyMode={CLOUDERY_MODE_LOGIN} />
      )

      const viewSignin = getByTestId('ViewSignin')
      const viewLogin = getByTestId('ViewLogin')

      expect(viewSignin).toHaveStyle({
        zIndex: 1
      })
      expect(viewLogin).toHaveStyle({
        zIndex: 2
      })
    })

    it('Should display Login view on top of Signin view if CLOUDERY_MODE_SIGNING', async () => {
      const { getByTestId } = render(
        <ClouderyView clouderyMode={CLOUDERY_MODE_SIGNING} />
      )

      const viewSignin = getByTestId('ViewSignin')
      const viewLogin = getByTestId('ViewLogin')

      expect(viewSignin).toHaveStyle({
        zIndex: 2
      })
      expect(viewLogin).toHaveStyle({
        zIndex: 1
      })
    })

    it('Should not load Signin view if OnboardingPartner is set', async () => {
      useClouderyUrl.mockReturnValueOnce({
        urls: {
          loginUrl:
            'https://loginflagship?fqdn=SOME_EXISTING_INSTANCE.MYCOZY.CLOUD',
          isOnboardingPartner: true
        }
      })

      const { queryByTestId } = render(
        <ClouderyView clouderyMode={CLOUDERY_MODE_LOGIN} />
      )

      const viewSignin = queryByTestId('ViewSignin')

      expect(viewSignin).toBeNull()
    })
  })

  it('should display overlay over webview while loading', () => {
    // When
    const { queryByTestId } = render(<ClouderyView />)

    // Then
    expect(queryByTestId('overlay')).toBeTruthy()
  })

  it('should hide overlay 1 ms after loading is finished', async () => {
    // Given
    const { getAllByTestId, queryByTestId, getByTestId } = render(
      <ClouderyView />
    )
    const button = getAllByTestId('triggerOnLoadEnd')

    // When
    fireEvent.press(button[0]) // trigger onLoadEnd
    fireEvent.press(button[1]) // trigger onLoadEnd

    await waitForElementToBeRemoved(() => getByTestId('overlay'))
    expect(queryByTestId('overlay')).toBeFalsy()
  })
})
