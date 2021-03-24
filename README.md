# Cozy React Native Web POC

## Introduction
This POC aims to demonstrate the use of reusable component for 
react native and react (web).

## Setup / Requirements
- [RN Environnement setup](https://reactnative.dev/docs/environment-setup)
- install XCode and Android Studio (or Android SDK)

## Run the React Native App

### First time

```bash
# Download Dependencies
$ yarn

# Run native server 
$ yarn start # (must be started for the following commands)

# Run on iOS Device 
$ cd ios && pod install # Only the first time
$ yarn ios 

# Run on Android Device
$ yarn android

# Run in the browser 
$ yarn web
```


### Run App tests
```bash
$ yarn test
```

