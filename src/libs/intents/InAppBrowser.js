import { InAppBrowser } from 'react-native-inappbrowser-reborn'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BrowserResult } from 'react-native-inappbrowser-reborn/types'

const IAB_OPTIONS = {
  // iOS Properties
  readerMode: false,
  animated: true,
  modalPresentationStyle: 'fullScreen',
  modalTransitionStyle: 'coverVertical',
  modalEnabled: true,
  enableBarCollapsing: false,
  // Android Properties
  showTitle: true,
  toolbarColor: '#8e9094',
  secondaryToolbarColor: 'black',
  enableUrlBarHiding: true,
  enableDefaultShare: true,
  forceCloseOnRedirection: false,
  showInRecents: true,
  animations: {
    startEnter: 'slide_in_right',
    startExit: 'slide_out_left',
    endEnter: 'slide_in_left',
    endExit: 'slide_out_right'
  }
}

/**
 * Show InAppBrowser with the specified url
 *
 * @param {String} options.url - url to which open the InAppBrowser
 * @returns {BrowserResult}
 */
export const showInAppBrowser = ({ url }) => {
  return InAppBrowser.open(url, IAB_OPTIONS)
}

/**
 * CLose current InAppBrowser
 */
export const closeInAppBrowser = () => {
  return InAppBrowser.close()
}
