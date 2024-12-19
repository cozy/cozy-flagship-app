# How to debug Offline mode

The Flagship app now handle Offline mode, this means that it can be open and run while the device is offline

This features implies that we can debug the app while using an offline device. This document explains how to do it

## Android emulator

On android, in order to set the device offline, use the top drawer menu, open the `Internet` menu and then disable both the Mobile Data and the Wi-Fi entries 

Since ReactNative 0.72, the ReactNative debug link won't work by default if the emulator is offline. This can be fixing by running the following commands from a terminal while the emulator is running:
- `adb root`
- `adb reverse tcp:8081 tcp:8081`
- `adb shell setprop metro.host "localhost"`

When executed, those commands allow to build, deploy and hot-reload the ReactNative app from an offline emulator. The debug console is also functional

## iOS simulator

iOS simulator seems not to provide a comfortable way to debug the app offline. The only way to set the simulator offline is to set the entire computer offline, but this is not an acceptable solution is we are debuging using a locally running cozy-stack as it will still be reachable by the simulator

## Physical devices

On physical iOS and Android device, it is possible to debug the app by setting the device offline

However this will break build, hot-reload and console debugging features

To mitigate this, it is possible to use Universal Links to extract console logs and DB files from the device

For console logs, please refer to [How to retrieve logs in release mode](how-to-retrieve-logs-in-release.md) documentation

For DB files, it is possible to send them by email using the following link:

- https://links.mycozy.cloud/flagship/senddb or [cozy://senddb](cozy://senddb)
  - trigger the OS send email intent pre-filled with DB files and Cozy's support email

## Reset local PouchDB

While debugging offline features, it is possible to corrupt the local PouchDB files (i.e. by injecting non valid documents)

It is possible to reset the local PouchDB files using the following link:

- https://links.mycozy.cloud/flagship/resetdb or [cozy://resetdb](cozy://resetdb)
  - Reset the local PouchDB and restart the app
