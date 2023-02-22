# How to release

This documentation explains how to create Android and iOS release bundle before publishing them

This documentation does not explain how to handle app's versioning nor how to publish bundles on
respective stores as those steps highly depend on your release process

## Preparation

Before creating the release bundle, always do the following:

- Execute `yarn install` on the project

## Release on Google PlayStore (Android)

- Put your signing certificate in `android/app/cozycloudkey.keystore`
  - More details about signing certificates: https://developer.android.com/studio/publish/app-signing
- Put your signing certificate's password in `android/gradle.properties` by replacing `REPLACE_BY_CERTIFICATE_PASS` (:warning: never commit this file)
- Generate an Android App Bundle
  - `cd android`
  - `./gradlew bundleRelease`
- You can test the result on your phone by executing the following command line
  - `npx react-native run-android --variant=release`
- The generated AAB (Android App Bundle) is in `android/app/build/outputs/bundle/release/app-release.aab`

# Release on App Store (iOS)

- Execute `cd ios && pod install`
- Open `ios/CozyReactNative.xcworkspace` in XCode
- Open menu `Product → Scheme → Edit Scheme...` and set `Build configuration` to `Release`
- Click on menu `Product → Archive` (if this menu is grayed, check that `Any iOS Device (arm 64)` is the current build target)
- When archiving is done, select the archive and click on `Distribute App`
