# How to debug Onboarding Partner

On App's first launch, we try to detect the installation context so we can extract Onboarding Partner and display custom instructions to our users

The Onboarding Partner feature is based on [Google Play Install Referrer API](https://developer.android.com/google/play/installreferrer)

> **Note**
> When an app is installed using a Referrer URI, the referrer value won't change until the App is reinstalled (or after 90days but our code will use the initial value anyway)

## Build a Referrer URI

In order to build a Rerrer URI, you can use the following generator
- https://developers.google.com/analytics/devguides/collection/android/v4/campaigns#google-play-url-builder

The expected values are the following:
- Application ID: `io.cozy.flagship.mobile`
- Campaign Source: the partner name
- Campaign Content: the provided context (i.e `MesPapiers`, `default` etc)
- Campaign Name: `onboarding_partner`

## Testing on production (phone with Play Store installed)

When testing on production, build a referrer URI and install the App by opening this URI from your device

## Testing on local dev (phone with Play Store installed)

If the feature you want to test is not deployed yet, then do the following:
- Build a referrer URI and open it from your device
- When the Play Store is opened, DO NOT click on `Install`
- Use a command line to manually install the app on the device
  - `yarn android` or `adb install -r XXX.apk`

## Testing on emulator (if no Play Store installed)

As the Install Referrer API depends on the Play Store app, if your device does not have it, then you won't be able to test the entire scenario

However it is still possible to test the app's behavior when it detects an Install Referrer

To do this, do the following:
- Using flipper, edit the App's AsyncStorage and delete the `DevicePersistedStorageKeys.OnboardingPartner` entry
  - Key corresponding to `DevicePersistedStorageKeys.OnboardingPartner` can be found in `src/libs/localStore/storage.ts`
- Edit `dev-config.ts` and set `forceInstallReferrer` to `true`
  - If needed, edit the `enforcedInstallReferrer` entry with expected values
- Restart the App
