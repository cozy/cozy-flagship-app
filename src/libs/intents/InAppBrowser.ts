import { BrowserResult, InAppBrowser } from 'react-native-inappbrowser-reborn'

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
 */
export const showInAppBrowser = (args: {
  url: string
}): Promise<BrowserResult> => {
  return InAppBrowser.open(args.url, IAB_OPTIONS)
}

/**
 * CLose current InAppBrowser
 */
export const closeInAppBrowser = (): Promise<null> => {
  InAppBrowser.close()
  return Promise.resolve(null)
}
