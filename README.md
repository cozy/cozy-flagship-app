# Cozy React Native

## Setup / Requirements
- [RN Environnement setup](https://reactnative.dev/docs/environment-setup)
- install XCode and Android Studio (or Android SDK)
- Node 16

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

## TROUBLESHOOTING

When installation has already succeeded, and a rebase happens, sometimes, it is hard to well update the App.
Here is the full list of instructions you can follow to avoid most of the issues:

1. Start Mailhog by running `mailhog` in the terminal (see [howTos/dev/sendmail](https://docs.cozy.io/en/howTos/dev/sendmail/))
2. Install and start `cozy-stack` with `cozy-home` project correctly

<details>
    <summary>More details how to start cozy-stack correctly with cozy-home</summary>

a. For more details on how to create a dev environment read [cozy-stack documentation](https://docs.cozy.io/en/cozy-stack/cli/cozy-stack_serve/) and [cozy-home documentation](https://github.com/cozy/cozy-home/blob/master/docs/develop.md)

b. For `cozy-react-native` important parameters to run `cozy-stack` are:
  * `--appdir home:/PATH_TO/cozy/cozy-home/build` - configure your local `cozy-home` project
  * `--host 0.0.0.0` - allow access from local network
  * `--mail-port 1025 --mail-disable-tls` - configure email server (see [howTos/dev/sendmail](https://docs.cozy.io/en/howTos/dev/sendmail/))
</details>

3. Start `cozy-home` (later you can start with [locally hosted webviews](https://github.com/cozy/cozy-react-native/blob/master/README.md#working-with-locally-hosted-webviews))
`cd cozy/cozy-home` && `git checkout origin/master && git fetch && yarn && yarn start`
4. Install and Start React Native
`cd cozy/cozy-react-native/` && `git checkout origin/master && git fetch && yarn && yarn start`
5. Start the emulator

<details>
    <summary>Starting iOS emulator</summary>

a. Install iOS dependencies
`cd cozy/cozy-react-native/ios` && `pod install`

b. Start Xcode

c. Choose a simulator model in the devices menu

d. Click on `Play` button to build app, that start simulator

</details>

<details>
    <summary>Starting Android emulator</summary>
<p>
a. Run Android app on emulator
   `yarn android`

</p>
</details>

6. To connect, use `http://cozy.192-168-1-102.nip.io:8080` if `192.168.1.102` is your ifconfig and after creating a nip.io URL from it.
   a. When using a nip.io URL, you must create a `cozy-stack` instance with the same FQDN (ex: `cozy.192-168-1-102.nip.io:8080`)
