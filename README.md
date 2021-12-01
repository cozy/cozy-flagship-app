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

# (DEPREACTED FOR NOW. You should dev on Android) Run on iOS Device
$ cd ios && pod install # Only the first time
$ yarn ios

```


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
