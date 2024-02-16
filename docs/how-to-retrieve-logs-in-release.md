# How to retrieve logs in release mode

When the app is build in release mode, some debugging tools are not available anymore

For example Flipper is not enabled nor the browser's devtools. Also app's `console.log` is not accessible through metro anymore

However there are still some solution to retrieve some logs from the device

This document explains how to retrieve them

# Send logs by email

It is possible to send logs by email using the 3 following links:

- https://links.mycozy.cloud/flagship/enablelogs or [cozy://enablelogs](cozy://enablelogs)
  - tell the app to start recording logs into a local file
- https://links.mycozy.cloud/flagship/sendlogs or [cozy://sendlogs](cozy://sendlogs)
  - trigger the OS send email intent pre-filled with log files and Cozy's support email
- https://links.mycozy.cloud/flagship/disablelogs or [cozy://disablelogs](cozy://disablelogs)
  - tell the app to stop recording logs

# Android

To retrieve Android logs, you need to use ADB

ADB is available with Android Studio, but you can download standalone version in https://developer.android.com/studio/releases/platform-tools#downloads (i.e. if you want a non-dev user to retrieve their logs)

Plug the Android device to a computer with a USB cable, run the app, and then in the computer execute the following bash command:
```bash
adb logcat --pid=$(adb shell pidof -s io.cozy.flagship.mobile)
```

In order to log into a file use the following command, then press `ctrl+c` at the end of the manipulation:
```bash
adb logcat --pid=$(adb shell pidof -s io.cozy.flagship.mobile) > flagship_logs.txt
```

# iOS

## Get system logs

System logs can be useful to retrieve crash data. However those logs do not show `console.log` from the app.

- Open XCode and open `Window/Devices and Simulators`
- In the opened window, select the device or simulator that needs to be logged
- In order to retrieve crash logs, click on `View Device Logs`
- In order to retrieve full system logs, click on `Open Console` and then `start`
  - Logs can be filtered by app name. You can filter by `CozyReactNative` to retrieve this project's logs.

![](/docs/images/xcode_devices_and_simulators.png)
![](/docs/images/xcode_device_console.png)

## Get app logs

There is no tool to retrieve app's log in Release mode

If logging in Release mode is necessary, then a dedicated build should be made in order to redirect logs into a file stored in the device and then to make this file accessible through `iTunes file sharing` protocol

To do this:
- Open XCode
- In info.plist set `Application supports iTunes file sharing=TRUE`
- Edit the project to redirect logs into a file (required code can be found in [this PR](https://github.com/cozy/cozy-react-native/pull/325))
- Deploy the app in testflight or export it in dev mode

Then in order to retrieve the log:
- Run the app to generate logs
- Plug the iPhone to your mac
- In the mac's Finder, select the iPhone in the left pane
- In the `Files` tab, open `Cozy` element and find `logs.txt`
- Drag&drop the `logs.txt` file into a local folder

![](/docs/images/finder_iphone_files.png)

> **Warning**
> Do no release those edits in a public release as those logs may contain sensitive data. Instead you should use TestFlight or a dev export