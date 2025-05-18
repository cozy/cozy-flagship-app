import { Platform } from 'react-native'

export const getLocalFonts = (): string => {
  const fontUrlRegular =
    Platform.select({
      ios: 'Lato-Regular.ttf',
      android: 'file:///android_asset/fonts/Lato-Regular.ttf'
    }) ?? ''

  const fontUrlBold =
    Platform.select({
      ios: 'Lato-Bold.ttf',
      android: 'file:///android_asset/fonts/Lato-Bold.ttf'
    }) ?? ''

  const fontUrlInterRegular =
    Platform.select({
      ios: 'Inter-Regular.ttf',
      android: 'file:///android_asset/fonts/Inter-Regular.ttf'
    }) ?? ''

  const fontUrlInterBold =
    Platform.select({
      ios: 'Inter-Bold.ttf',
      android: 'file:///android_asset/fonts/Inter-Bold.ttf'
    }) ?? ''

  return `
    @font-face {
      font-family: Lato;
      font-style: normal;
      font-weight: normal;
      src: url("${fontUrlRegular}");
      font-display: fallback;
    }

    @font-face {
      font-family: Lato;
      font-style: normal;
      font-weight: bold;
      src: url("${fontUrlBold}");
      font-display: fallback;
    }

    @font-face {
      font-family: Inter;
      font-style: normal;
      font-weight: normal;
      src: url("${fontUrlInterRegular}");
      font-display: fallback;
    }

    @font-face {
      font-family: Inter;
      font-style: normal;
      font-weight: bold;
      src: url("${fontUrlInterBold}");
      font-display: fallback;
    }

    body {
      font-family: Inter;
    }
  `
}
