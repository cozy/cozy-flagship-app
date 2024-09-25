# Cozy Flagship App

The flagship app is meant to get all your Cozy in a single mobile app.
This notably includes the possiblity to run client-side konnectors, to get your data without any server-side scraping.

## Setup / Requirements

- Node 16
- [React-Native Environnement setup](https://reactnative.dev/docs/environment-setup)
  - Please follow the React Native CLI part and make sure all the requirements are met with the correct versions.
- [iOS only] Install XCode 
- [Android only] Install Android Studio (or Android SDK)
- [Android only] Java 11
- [Android only] Install NDK (21.4.7075529) and CMake (3.10.2) from Android Studio's SDK Manager
- [Android only] Copy the Android's `debug.keystore` from Cozy's password-store into `android/app/debug.keystore`
  - Run `pass show app-amirale/Certificates/debug.keystore > android/app/debug.keystore`
  - If you don't have access to Cozy's password-store, just generate a new `debug.keystore` file
    - Run `keytool -genkey -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000`
- [Android only] [Fix build tools issue](#fix-build-tools-error)


### Create and configure the env file

Create the env file: `cp .env.example .env`

#### Brand configuration

You need some configuration depending on your brand needs.
As you probably just need the official Cozy brand, just run:

`yarn brand:configure:cozy`.

#### Sentry configuration

If you are a Cozy developer, please get the actual Sentry configuration in the env file.
For this, you need to decrypt the `cozy-react-native/sentry.properties` file in the `password-store-team` repository and add it in `.env` file as `SENTRY_AUTH_TOKEN`.


## Run the Cozy Flagship App

### First time

Note: Before running the app, please copy `cozy-home` files locally first. See [How to install cozy-home in local assets](docs/how-to-install-home.md)

```bash
# Download Dependencies
$ yarn

# Run native server
$ yarn start # (must be started for the following commands)

# Run on Android Device
$ yarn android

# Run on iOS Device
$ cd ios && pod install # Only the first time
$ yarn ios

```

Do not forget to check our [Tips for a better developer experience](docs/tips-for-a-better-developer-experience.md) !

More information about Android variant [here](https://github.com/cozy/cozy-flagship-app/blob/master/docs/how-to-debug-notifications.md).

### Working with local stack

If you need to access a local instance, do not forget to enable the `--host` and `mailhog` options:
`$ cozy-stack serve --host 0.0.0.0 --mailhog`

You also need a running mailhog server. To have more details about how to send mails, [see here](https://docs.cozy.io/en/howTos/dev/sendmail/).



### Working with locally hosted webviews

The easiest way to develop on locally hosted webviews (like any Cozy apps like Drive or Contacts) is to :
- build your cozy-app
- change the version number in the cozy-app's build/manifest.webapp
- open the flagship app and go to home cozy-app
- go to your cozy-app and wait 10s => flagship app will download the just builded version in background
- go to home cozy-app
- go to your cozy-app => you will be on the just builded version

Alternatively, you can also see the following sections to work with hot reload. It is not guaranteed to work and we strongly advice to try at least one time without hot reload.

#### On Android

- Create a cozy instance with the following format : `foobar.10-0-2-2.nip.io:8080`, so the webview browser has access to cozy-stack instances thanks to the redirection done by https://nip.io. `10.0.2.2` being the local IP address of your emulator. If you are working with a physical device, use you computer local IP, e.g. `192.168.1.50`. Note your device must be on the same network.
- Launch your cozy app with `DEV_HOST=(some accessible local IP)` preceding the actual start command, so the webview browser has access to webpack dev server assets. See some examples below:
  - `DEV_HOST="$(ip -4 address show eth0| grep -Po 'inet [^/]+' | cut -d' ' -f2)" yarn start`
  - `DEV_HOST="$(hostname -I | xargs)" yarn start`
- Disable the local httpServer by setting to `true` disableGetIndex in `src/constants/dev-config.ts`
- Your webview browser should now be able to use a locally hosted cozy-app in development/hot-reload mode

You can then connect to your local stack using the following URL : `http://foobar.10-0-2-2.nip.io:8080`

#### On iOS simulator

- Create a cozy instance with the \*.cozy.tools:8080 format
- Disable the local httpServer by setting to `true` disableGetIndex in `src/constants/dev-config.ts`
- Your webview browser should now be able to use a locally hosted cozy-app in development/hot-reload mode

### Run App tests

```bash
$ yarn test
```
 
### Debugging

Android: To get native log on Android:

```bash
adb logcat --pid=$(adb shell pidof -s io.cozy.flagship.mobile)
```

Use [flipper](https://fbflipper.com/docs/features/react-native/) to
have access to a React Native Debuguer.
If you are running MacOS on a M1 or M2 computer, use [this optimized version](https://github.com/chiragramani/FlipperReleases) instead.

To have access to the AsyncStorage content you can install async-storage-advanced plugin (see https://github.com/cozy/cozy-react-native/pull/270
for more information).

A guide for debugging in release mode can be found here: [How to retrieve logs in release mode](docs/how-to-retrieve-logs-in-release.md)

### Inspecting a webview

#### Android

In order to inspect the content of the webview & get access to the console:
In chrome: `chrome://inspect/#devices`

(you can read https://github.com/cozy/react-native-webview/blob/cozy_main/docs/Debugging.md#android--chrome for more informations)

#### iOS

If you have an iOS >= 16.4 you need to do the following:

Add :
```
#if __MAC_OS_X_VERSION_MAX_ALLOWED >= 130300 || \
    __IPHONE_OS_VERSION_MAX_ALLOWED >= 160400 || \
    __TV_OS_VERSION_MAX_ALLOWED >= 160400
    // https://webkit.org/blog/13936/enabling-the-inspection-of-web-content-in-apps/
    if (@available(macos 13.3, ios 16.4, tvOS 16.4, *)) {
        _webView.inspectable = YES;
    }
#endif
```

to the RNCWebview.m file within the `didMoveToWindow` function (line ~340)

Then you can inspect the content from Safari

See https://github.com/cozy/react-native-webview/blob/cozy_main/docs/Debugging.md#ios--safari for more information

## Build an offline apk

- First, you must have `yarn start` running in another terminal
- Then run ./scripts/build-debug-offline-apk.sh
- The output will give you the path to the apk

## patch-package

After installation of every npm packages, yarn applies patches to react-native-webview.
[Patch-package](https://www.npmjs.com/package/patch-package) is a utility is used to apply the patches located in the patches folder.

## TROUBLESHOOTING

When installation has already succeeded, and a rebase happens, sometimes, it is hard to well update the App.
Here is the full list of instructions you can follow to avoid most of the issues:

1. Start Mailhog by running `mailhog` in the terminal (see [howTos/dev/sendmail](https://docs.cozy.io/en/howTos/dev/sendmail/))
2. Install and start `cozy-stack` with `cozy-home` project correctly

<details>
    <summary>More details how to start cozy-stack correctly with cozy-home</summary>

a. For more details on how to create a dev environment read [cozy-stack documentation](https://docs.cozy.io/en/cozy-stack/cli/cozy-stack_serve/) and [cozy-home documentation](https://github.com/cozy/cozy-home/blob/master/docs/develop.md)

b. For `cozy-react-native` important parameters to run `cozy-stack` are:

- `--appdir home:/PATH_TO/cozy/cozy-home/build` - configure your local `cozy-home` project
- `--host 0.0.0.0` - allow access from local network
- `--mail-port 1025 --mail-disable-tls` - configure email server (see [howTos/dev/sendmail](https://docs.cozy.io/en/howTos/dev/sendmail/))
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
   `yarn android --variant=devDebug`

</p>
</details>

6. To connect, use `http://cozy.192-168-1-102.nip.io:8080` if `192.168.1.102` is your ifconfig and after creating a nip.io URL from it.
   a. When using a nip.io URL, you must create a `cozy-stack` instance with the same FQDN (ex: `cozy.192-168-1-102.nip.io:8080`)

### Fix build tools error

To avoid the error `Installed Build Tools revision 33.0.0 is corrupted. Remove and install again using the SDK Manager.`, run the commands below:

```
cd $ANDROID_HOME/build-tools/33.0.0
mv d8 dx
cd lib
mv d8.jar dx.jar
```

[More information](https://github.com/cozy/cozy-flagship-app/commit/d76e130220a87947313f7a17da8f3d9b59f704e6).


### Common errors

* XCode: `error: An organization slug is required`

Read the Sentry configuration paragraph above.

* Application blocked on the Splashscreen

Verify that the Cozy you are login into is using the last version of `cozy-home`, and try again

* Error on app `Tried to register two views with the same name RCTIndexInjectionWebView`

This may happen after development's HotReload occurs. When encountered just restart the app. This should not happen on production.

* Cozy-app `cozy-notes` is not working when served locally

`cozy-notes` bundle relies on a specific `tar_prefix`. When served from local `--appDir` then no `tar_prefix` is applied. However the Cozy's registry sends info from production app which has a defined `tar_prefix`.
This would break the app as ReactNative will try to serve local assets using a non-existing directory.
To prevent conflict on this, please increase your local `cozy-notes`'s version in the built `manifest.webapp` for a version that does not exist in production (i.e: `"version": "0.0.X.notexisting"`)

* Java-related errors.

Please make sure that Java 11 is installed and used.

Run :

```
source ./reset-android.sh
```

* Command PhaseScriptExecution failed with a nonzero exit code

When compiling the app from XCode, if you encounter a `Command PhaseScriptExecution failed with a nonzero exit code` error, then your NodeJS configuration may be invalid
If using NVM, then ensure that `/usr/local/bin/node` is correctly linked to your NVM default NodeJS location
More info: https://github.com/facebook/react-native/issues/32984#issuecomment-1165385007

* Brand configuration error
```
error: cannot find symbol
      .addHeader("User-Agent", BuildConfig.USER_AGENT + "-" + BuildConfig.VERSION_NAME)
                                          ^
  symbol:   variable USER_AGENT
  location: class BuildConfig
``` 
Run `yarn brand:configure:cozy`

* `INSTALL_FAILED_VERSION_DOWNGRADE` error

Please desinstall any cozy-flagship app you might have on your device

* `No online devices found.` error

Check your device is visible and authorized by running `adb devices`.
Restart adb if it does not appear.
If it appears unauthorized, you might need an extra step: https://developer.android.com/studio/run/device?hl=fr#setting-up

* `INSTALL_FAILED_USER_RESTRICTED` error

When the app is being installed on your device for the first time, you need to manually accept it.