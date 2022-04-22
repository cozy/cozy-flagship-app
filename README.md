# Cozy React Native

## Setup / Requirements
- [RN Environnement setup](https://reactnative.dev/docs/environment-setup)
- install XCode and Android Studio (or Android SDK)
- Node 16

## Sentry configuration (REQUIRED, DO NOT SKIP)

This application will not run without a working Sentry configuration, even in development mode.

### Getting the configuration
In order to configure it, first you have to decrypt the `cozy-react-native/sentry.properties` file in the `password-store-team` repository.

Once this is done, you should now have a decrypted file resembling `android/sentry.properties.example`.

### Installing the configuration
You simply have to copy paste the content of the decrypted file into both `android/sentry.properties.example` and `ios/sentry.properties.example` and then rename them as `sentry.properties` (mandatory name).

## Run the React Native App

### First time

```bash
# Download Dependencies
$ yarn

#install konnectors (for now)
$ cd connectors/sncf
$ yarn install && yarn build
$ cd ../blablacar
$ yarn install && yarn build

# Run native server
$ yarn start # (must be started for the following commands)

# Run on Android Device
$ yarn android

# Run on iOS Device
$ cd ios && pod install # Only the first time
$ yarn ios

```

### Working with locally hosted webviews
* Create a cozy instance with the following format : `foobar.10-0-2-2.nip.io`, so the webview browser has access to cozy-stack instances thanks to the redirection done by https://nip.io
* Launch your cozy app with `DEV_HOST=(some accessible local IP)` preceding the actual start command, so the webview browser has access to webpack dev server assets. See some examples below:
    * `DEV_HOST="$(ip -4 address show eth0| grep -Po 'inet [^/]+' | cut -d' ' -f2)" yarn start`
    * `DEV_HOST="$(hostname -I | xargs)" yarn start`
* Your webview browser should now be able to use a locally hosted cozy-app in development/hot-reload mode

### Run App tests
```bash
$ yarn test
```

## How to run SNCF Connector

1. Sncf connector
    1. `cd connectors/sncf`
    2. Download all dependencies and build the connector : `yarn install && yarn build`
2. The mobile app
    1. Download all dependencies with `yarn install`
    2. **Only iOS**: `cd ios && pod install`
    3. Run on iOS (`yarn ios`) or Android (`yarn android`)
    4. Fill config.json file with your cozy instance and destination folder
    5. Generate token : (`yarn token`)
    6. yarn react-native start

## [Debugging the webview in chrome](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Debugging.md)



## Build an offline apk

* First, you must have `yarn start` running in another terminal
* Then run ./scripts/build-debug-offline-apk.sh
* The output will give you the path to the apk


## How to enable Flagship certification

Flagship certification is the process of verifying that the current running app is a genuine Cozy application.

This verification requires the `cozy-stack` to be configured with the app information.

To enable Flagship certification:
- Retrieve the project's Safetynet Api Key on the pass manager
  - Or generate a new one following Google documentation: https://developer.android.com/training/safetynet/attestation#add-api-key
- Create a file `src/api-keys.json` and fill it with the following content:
```json
{
  "androidSafetyNetApiKey": "YOUR_GOOGLE_SAFETYNET_API_KEY"
}
```
- On `src/libs/client.js` set `shouldRequireFlagshipPermissions` to `true`
- Read `cozy-client` instruction in [flagship-certification/README.md](https://github.com/cozy/cozy-client/blob/master/packages/cozy-client/src/flagship-certification/README.md)

If you want to disable Flagship certification:
- On `src/libs/client.js` set `shouldRequireFlagshipPermissions` to `false`
