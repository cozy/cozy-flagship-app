# 1.1.36

# 1.1.35

Bump only version to update iOS app name

# 1.1.34

## ✨ Features
 - New Twake UI

## 🐛 Bug Fixes


## 🔧 Tech


# 1.1.31

## ✨ Features

* Allow clisk konnectors to save data in their own account ([PR #1260](https://github.com/cozy/cozy-flagship-app/pull/1260))
* Allow clisk konnectors to run server job ([PR #1260](https://github.com/cozy/cozy-flagship-app/pull/1260))
* Allow clisk konnectors to have incognito mode ([PR #1260](https://github.com/cozy/cozy-flagship-app/pull/1260))
* Do not download the same file multiple times when multiple bills are related to the same file ([PR #1259](https://github.com/cozy/cozy-flagship-app/pull/1259))
* Force logout when konnector identifier is different from account name (to allow multi-account for clisk konnectors) ([PR #1255](https://github.com/cozy/cozy-flagship-app/pull/1255))
* Offers the possibility to save html traces on clisk konnector error ([PR #1254](https://github.com/cozy/cozy-flagship-app/pull/1254))

## 🐛 Bug Fixes


## 🔧 Tech

* Upgrade cozy-clisk to 0.38.1 ([PR #1259](https://github.com/cozy/cozy-flagship-app/pull/1259))
* Update Sentry to 5.33.1 ([PR #1252](https://github.com/cozy/cozy-flagship-app/pull/1252))
* Remove ui.darkmode.enabled flag condition ([PR #1246](https://github.com/cozy/cozy-flagship-app/pull/1246))

# 1.1.30

## ✨ Features


## 🐛 Bug Fixes
* Fixes a race condition leading to a blue screen ([PR #1241](https://github.com/cozy/cozy-flagship-app/pull/1241))

## 🔧 Tech


# 1.1.29

## ✨ Features


## 🐛 Bug Fixes


## 🔧 Tech
* Full dark mode support. Not enabled generally for the moment. ([PR #1222](https://github.com/cozy/cozy-flagship-app/pull/1222), [PR #1223](https://github.com/cozy/cozy-flagship-app/pull/1223), [PR #1228](https://github.com/cozy/cozy-flagship-app/pull/1228), [PR #1231](https://github.com/cozy/cozy-flagship-app/pull/1231))
* Update to React Native 0.72.12 ([PR #1161](https://github.com/cozy/cozy-flagship-app/pull/1161))
* Target Android API 34 ([PR #1225](https://github.com/cozy/cozy-flagship-app/pull/1225), [PR #1232](https://github.com/cozy/cozy-flagship-app/pull/1232))
* Add check on language files and add missing translations for en and es files ([PR #999](https://github.com/cozy/cozy-flagship-app/pull/999))
* Update react-native-background-geolocation ([PR #1227](https://github.com/cozy/cozy-flagship-app/pull/1227))
* Fix build related to react-native-gzip ([PR #1229](https://github.com/cozy/cozy-flagship-app/pull/1229))
* Fix build related to AndroidManifest ([PR #1230](https://github.com/cozy/cozy-flagship-app/pull/1230))

# 1.1.28

## ✨ Features


## 🐛 Bug Fixes
* Mes Papiers could crash during a document scan due to low memory ([PR #1208](https://github.com/cozy/cozy-flagship-app/pull/1208), [PR #1219](https://github.com/cozy/cozy-flagship-app/pull/1219))
* Sharing files to the app was not working properly on Ma Bulle app on iOS ([PR #1213](https://github.com/cozy/cozy-flagship-app/pull/1213))

## 🔧 Tech
* Partial dark mode support. Not enabled generally for the moment. ([PR #1214](https://github.com/cozy/cozy-flagship-app/pull/1214), [PR #1215](https://github.com/cozy/cozy-flagship-app/pull/1215), [PR #1217](https://github.com/cozy/cozy-flagship-app/pull/1217), [PR #1220](https://github.com/cozy/cozy-flagship-app/pull/1220))
* Give the list of instance's flags to the context sent to konnectors ([PR #1211](https://github.com/cozy/cozy-flagship-app/pull/1211))
* Move saved traceFiles into `Settings/Logs` directory to avoid user confusion about the file presence ([PR #1210](https://github.com/cozy/cozy-flagship-app/pull/1210))

# 1.1.27

## ✨ Features

* Use FR as default locale backup in GL version ([PR #1206](https://github.com/cozy/cozy-flagship-app/pull/1206))

## 🐛 Bug Fixes


## 🔧 Tech


# 1.1.26

## ✨ Features


## 🐛 Bug Fixes

* Prevent missing trips in CoahCO2 because of overlapping transitions ([PR #1192](https://github.com/cozy/cozy-flagship-app/pull/1192))
* Fix a bug that prevented Ecolyo to work on Android ([PR #1194](https://github.com/cozy/cozy-flagship-app/pull/1194))
* Fix a bug that prevented CoahCO2 logs to be sent by email ([PR #1201](https://github.com/cozy/cozy-flagship-app/pull/1201))
* The App should now display the correct action when sharing files to the App multiple times in a row ([PR #1190](https://github.com/cozy/cozy-flagship-app/pull/1190))
* Offers page now correctly handle links to the Cozy's support website ([PR #1202](https://github.com/cozy/cozy-flagship-app/pull/1202))

## 🔧 Tech

* Cozy-intent should now logs exceptions as warning ([PR #1196](https://github.com/cozy/cozy-flagship-app/pull/1196))
* Prepare plugins for future ReactNative 0.72 upgrade ([PR #1200](https://github.com/cozy/cozy-flagship-app/pull/1200))
* Improve Release CI by generating signed Universal APK andproviding it as artifact ([PR #1189](https://github.com/cozy/cozy-flagship-app/pull/1189))
* Update xcode version in github actions ([PR #1204](https://github.com/cozy/cozy-flagship-app/pull/1204))

# 1.1.25

## ✨ Features

* Add the ability to send app's logs by email ([PR #1187](https://github.com/cozy/cozy-flagship-app/pull/1187))

## 🐛 Bug Fixes

* Fix a bug that prevented to preview and download files ([PR #1193](https://github.com/cozy/cozy-flagship-app/pull/1193))
* Fix some wordings and translations ([PR #1186](https://github.com/cozy/cozy-flagship-app/pull/1186))
* Improve Client Side Connectors stability ([PR #1191](https://github.com/cozy/cozy-flagship-app/pull/1191))

## 🔧 Tech


# 1.1.24

## ✨ Features

* Improve backup performances ([PR #1100](https://github.com/cozy/cozy-flagship-app/pull/1100), [PR #1114](https://github.com/cozy/cozy-flagship-app/pull/1114), [PR #1118](https://github.com/cozy/cozy-flagship-app/pull/1118), [PR #1124](https://github.com/cozy/cozy-flagship-app/pull/1124))
* Implement mechanism to try CoachCO2 trip tracking on a free plan ([PR #1090](https://github.com/cozy/cozy-flagship-app/pull/1090) and [PR #1125](https://github.com/cozy/cozy-flagship-app/pull/1125))
* CoachCO2 trips should now appear faster after the end of a trip ([PR #1120](https://github.com/cozy/cozy-flagship-app/pull/1120), [PR #1133](https://github.com/cozy/cozy-flagship-app/pull/1133), [PR #1140](https://github.com/cozy/cozy-flagship-app/pull/1140))
* It is now possible to subscribe to a Cozy plan from the App ([PR #991](https://github.com/cozy/cozy-flagship-app/pull/991), [PR #1070](https://github.com/cozy/cozy-flagship-app/pull/1070), [PR #1131](https://github.com/cozy/cozy-flagship-app/pull/1131), [PR #1143](https://github.com/cozy/cozy-flagship-app/pull/1143), [PR #1145](https://github.com/cozy/cozy-flagship-app/pull/1145) and [PR #1181](https://github.com/cozy/cozy-flagship-app/pull/1181))
* TwoFactor authentication is not requested anymore when the user logs using their email ([PR #1174](https://github.com/cozy/cozy-flagship-app/pull/1174) and [PR #1177](https://github.com/cozy/cozy-flagship-app/pull/1177))

## 🐛 Bug Fixes

* Improve backup's UI ([PR #1104](https://github.com/cozy/cozy-flagship-app/pull/1104))
* Improve backup stability ([PR #1166](https://github.com/cozy/cozy-flagship-app/pull/1166), [PR #1173](https://github.com/cozy/cozy-flagship-app/pull/1173))
* CoachCO2 trip tracking toggle should now update correctly when activating tracking ([PR #1116](https://github.com/cozy/cozy-flagship-app/pull/1116))
* CoachCO2 trip tracking should now have less impact on battery level ([PR #1119](https://github.com/cozy/cozy-flagship-app/pull/1119))
* Fix a bug that prevented notifications to open the correct cozy-app in some scenario ([PR #1123](https://github.com/cozy/cozy-flagship-app/pull/1123) and [PR #1130](https://github.com/cozy/cozy-flagship-app/pull/1130))
* Fix a bug that would show incorrect texts on iOS when a plural form is used ([PR #1129](https://github.com/cozy/cozy-flagship-app/pull/1129))
* Improve Client Side Connectors stability ([PR #1089](https://github.com/cozy/cozy-flagship-app/pull/1089), [PR #1159](https://github.com/cozy/cozy-flagship-app/pull/1159), [PR #1171](https://github.com/cozy/cozy-flagship-app/pull/1171) and [PR #1180](https://github.com/cozy/cozy-flagship-app/pull/1180))
* Fix bugs where splashscreen was not hidden or hidden to soon ([PR #1135](https://github.com/cozy/cozy-flagship-app/pull/1135), [PR #1139](https://github.com/cozy/cozy-flagship-app/pull/1139), [PR #1153](https://github.com/cozy/cozy-flagship-app/pull/1153) and [PR #1162](https://github.com/cozy/cozy-flagship-app/pull/1162))
* Ensure autofocus on Lock screens ([PR #1095](https://github.com/cozy/cozy-flagship-app/pull/1095))
* Fix a bug where the App's UI could be displayed behind the phone's navigation bar ([PR #1151](https://github.com/cozy/cozy-flagship-app/pull/1151) and [PR #1156](https://github.com/cozy/cozy-flagship-app/pull/1156))
* Improve offline mitigation on Onboarding screens ([PR #1149](https://github.com/cozy/cozy-flagship-app/pull/1149))
* Improve CoachCO2 trip tracking feature ([PR #1163](https://github.com/cozy/cozy-flagship-app/pull/1163), [PR #1157](https://github.com/cozy/cozy-flagship-app/pull/1157), [PR #1165](https://github.com/cozy/cozy-flagship-app/pull/1165), [PR #1167](https://github.com/cozy/cozy-flagship-app/pull/1167), [PR #1168](https://github.com/cozy/cozy-flagship-app/pull/1168), [PR #1178](https://github.com/cozy/cozy-flagship-app/pull/1178), [PR #1179](https://github.com/cozy/cozy-flagship-app/pull/1179), [PR #1176](https://github.com/cozy/cozy-flagship-app/pull/1176), [PR #1182](https://github.com/cozy/cozy-flagship-app/pull/1182))
* Improve app stability on old Android versions (< android 7) ([PR #1170](https://github.com/cozy/cozy-flagship-app/pull/1170))
* Fix MaBulle App's icon ([PR #1188](https://github.com/cozy/cozy-flagship-app/pull/1188))

## 🔧 Tech

* ReloadInterceptorWebView interceptions do not produce an error log anymore ([PR #1096](https://github.com/cozy/cozy-flagship-app/pull/1096))
* Add foundations for sharing cozy files to other phone's apps ([PR #1105](https://github.com/cozy/cozy-flagship-app/pull/1105), [PR #1088](https://github.com/cozy/cozy-flagship-app/pull/1088), [PR #1144](https://github.com/cozy/cozy-flagship-app/pull/1144))
* Rework Flagship API to handle status bar and navigation bar colors ([PR #1082](https://github.com/cozy/cozy-flagship-app/pull/1082))
* Rework Lock related screens ([PR #1092](https://github.com/cozy/cozy-flagship-app/pull/1092), [PR #1146](https://github.com/cozy/cozy-flagship-app/pull/1146))
* Add support of navigator clipboard API ([PR #1141](https://github.com/cozy/cozy-flagship-app/pull/1141))
* Fix Android build by forcing Android tools version ([PR #1136](https://github.com/cozy/cozy-flagship-app/pull/1136))
* Improve documentation ([PR #1115](https://github.com/cozy/cozy-flagship-app/pull/1115), [PR #1132](https://github.com/cozy/cozy-flagship-app/pull/1132))
* Update Sentry ([PR #1134](https://github.com/cozy/cozy-flagship-app/pull/1134))
* Remove Dependabot configuration ([PR #1150](https://github.com/cozy/cozy-flagship-app/pull/1150))
* Prevent CoachCO2 tracking logs to be logged in Sentry when the app crashes ([PR #1158](https://github.com/cozy/cozy-flagship-app/pull/1158))
* Homogenize user-agent through all application's webviews ([PR #1164](https://github.com/cozy/cozy-flagship-app/pull/1164))
* Improve CI publish workflow on white label apps ([PR #1172](https://github.com/cozy/cozy-flagship-app/pull/1172))
* Refactor all AsyncStorage calls to prepare future migration to MMKV ([PR #1169](https://github.com/cozy/cozy-flagship-app/pull/1169))
* Not active yet: Add foundation to allow sending app's log by email ([PR #1137](https://github.com/cozy/cozy-flagship-app/pull/1137), [PR #1183](https://github.com/cozy/cozy-flagship-app/pull/1183))
* Fix MaBulle App's build ([PR #1188](https://github.com/cozy/cozy-flagship-app/pull/1188))

# 1.1.23

Android only release.

## ✨ Features


## 🐛 Bug Fixes


## 🔧 Tech

* Migrate Flagship certification from Google SafetyNet to Google Play Integrity ([PR #1126](https://github.com/cozy/cozy-flagship-app/pull/1126) and [PR #1142](https://github.com/cozy/cozy-flagship-app/pull/1142))

# 1.1.22

## ✨ Features

* Autofill email's recipient with Cozy's support email when sending CoachCO2 logs to support ([PR #1121](https://github.com/cozy/cozy-flagship-app/pull/1121))

## 🐛 Bug Fixes


## 🔧 Tech


# 1.1.21

## ✨ Features

* Improve CoachCO2 trip tracking ([PR #1017](https://github.com/cozy/cozy-flagship-app/pull/1017))
* Rename Ma Bulle to Cozy Métropole de Lyon ([PR #1084](https://github.com/cozy/cozy-flagship-app/pull/1084), [PR #1085](https://github.com/cozy/cozy-flagship-app/pull/1085) and [PR #1086](https://github.com/cozy/cozy-flagship-app/pull/1086))
* Change UI for new Cozy Métropole de Lyon variant ([PR #1095](https://github.com/cozy/cozy-flagship-app/pull/1095), [PR #1098](https://github.com/cozy/cozy-flagship-app/pull/1098), [PR #1099](https://github.com/cozy/cozy-flagship-app/pull/1099), [PR #1101](https://github.com/cozy/cozy-flagship-app/pull/1101) and [PR #1103](https://github.com/cozy/cozy-flagship-app/pull/1103))

## 🐛 Bug Fixes

* Fix a but that would redirect the app to cozy-home when the app is focused ([PR #1083](https://github.com/cozy/cozy-flagship-app/pull/1083))
* It is now possible to run both Cozy and MaBulle apps simultaneously ([PR #1117](https://github.com/cozy/cozy-flagship-app/pull/1117))

## 🔧 Tech

* Add Storybook.js into the project ([PR #1080](https://github.com/cozy/cozy-flagship-app/pull/1080))
* Migrate HttpServer Javascript code to Typescript ([PR #1069](https://github.com/cozy/cozy-flagship-app/pull/1069))

# 1.1.20

## ✨ Features

* Add printing feature ([PR #1038](https://github.com/cozy/cozy-flagship-app/pull/1038))
* Manage normal and inverted themes ([PR #1062](https://github.com/cozy/cozy-flagship-app/pull/1062))
* Improve dedup backup algorithm to support old backup ([PR #1077](https://github.com/cozy/cozy-flagship-app/pull/1077))
* Add new non native modal ([PR #1066](https://github.com/cozy/cozy-flagship-app/pull/1066))

## 🐛 Bug Fixes

* Fix client side connectors bugs ([PR #1057](https://github.com/cozy/cozy-flagship-app/pull/1057), [PR #1073](https://github.com/cozy/cozy-flagship-app/pull/1073))
* Fix send files bugs ([PR #1068](https://github.com/cozy/cozy-flagship-app/pull/1068), [PR #1074](https://github.com/cozy/cozy-flagship-app/pull/1074))
* Fix UI bugs ([PR #1061](https://github.com/cozy/cozy-flagship-app/pull/1061), [PR #1065](https://github.com/cozy/cozy-flagship-app/pull/1065), [PR #1071](https://github.com/cozy/cozy-flagship-app/pull/1071), [PR #1075](https://github.com/cozy/cozy-flagship-app/pull/1075), [PR #1052](https://github.com/cozy/cozy-flagship-app/pull/1052))
* Avoid to start multiple backup in parallel ([PR #1064](https://github.com/cozy/cozy-flagship-app/pull/1064))

## 🔧 Tech
* Improve logging ([PR #1055](https://github.com/cozy/cozy-flagship-app/pull/1055), [PR #1067](https://github.com/cozy/cozy-flagship-app/pull/1067), [PR #1078](https://github.com/cozy/cozy-flagship-app/pull/1078))
* Improve network management ([PR #1046](https://github.com/cozy/cozy-flagship-app/pull/1046))
* Add Storybook ([PR #1056](https://github.com/cozy/cozy-flagship-app/pull/1056))
* Update dependencies ([PR #1053](https://github.com/cozy/cozy-flagship-app/pull/1053), [PR #1060](https://github.com/cozy/cozy-flagship-app/pull/1060), [PR #1076](https://github.com/cozy/cozy-flagship-app/pull/1076))
* Update icons on Android to latest standard ([PR #1063](https://github.com/cozy/cozy-flagship-app/pull/1063))

# 1.1.19

## ✨ Features

* Allow mespapiers app to control clisk konnectors ([PR #1047](https://github.com/cozy/cozy-flagship-app/pull/1047))

## 🐛 Bug Fixes

* Fix send files locales ([PR #1031](https://github.com/cozy/cozy-flagship-app/pull/1031))
* Fix UI bugs ([PR #1036](https://github.com/cozy/cozy-flagship-app/pull/1036), [PR #1037](https://github.com/cozy/cozy-flagship-app/pull/1037), [PR #1041](https://github.com/cozy/cozy-flagship-app/pull/1041), [PR #1043](https://github.com/cozy/cozy-flagship-app/pull/1043), [PR #1045](https://github.com/cozy/cozy-flagship-app/pull/1045))
* Fix backup bugs especially when backup folder has been deleted ([PR #1040](https://github.com/cozy/cozy-flagship-app/pull/1040), [PR #1044](https://github.com/cozy/cozy-flagship-app/pull/1044))
* Manage when destination folder is removed during konnector execution ([PR #1030](https://github.com/cozy/cozy-flagship-app/pull/1030))

## 🔧 Tech

* Improve logs ([PR #1035](https://github.com/cozy/cozy-flagship-app/pull/1035), [PR #1042](https://github.com/cozy/cozy-flagship-app/pull/1042), [PR #1039](https://github.com/cozy/cozy-flagship-app/pull/1039))
* Remove react-native-cameraroll patches ([PR #1048](https://github.com/cozy/cozy-flagship-app/pull/1048))
* Fix open handles in tests and update testing tools ([PR #1028](https://github.com/cozy/cozy-flagship-app/pull/1028))
* Improve password change scenario in lockscreen ([PR #1018](https://github.com/cozy/cozy-flagship-app/pull/1018))

# 1.1.18

## ✨ Features

* It is now possible to send files and images from the phone to the app ([PR #906](https://github.com/cozy/cozy-flagship-app/pull/906), [PR #996](https://github.com/cozy/cozy-flagship-app/pull/996), [PR #1001](https://github.com/cozy/cozy-flagship-app/pull/1001), [PR #1009](https://github.com/cozy/cozy-flagship-app/pull/1009), [PR #994](https://github.com/cozy/cozy-flagship-app/pull/994), [PR #1022](https://github.com/cozy/cozy-flagship-app/pull/1022), [PR #1023](https://github.com/cozy/cozy-flagship-app/pull/1023), [PR #1025](https://github.com/cozy/cozy-flagship-app/pull/1025), [PR #1027](https://github.com/cozy/cozy-flagship-app/pull/1027) and [PR #1029](https://github.com/cozy/cozy-flagship-app/pull/1029))
* Improve activities detection (walking, driving etc) when tracking CO2 emissions using GPS ([PR #906](https://github.com/cozy/cozy-flagship-app/pull/906) and [PR #1006](https://github.com/cozy/cozy-flagship-app/pull/1006))
* The CO2 emission tracking feature now shows a better description when requestion for GPS permissions ([PR #1005](https://github.com/cozy/cozy-flagship-app/pull/1005))
* Improve theming on login screen for our partners ([PR #1000](https://github.com/cozy/cozy-flagship-app/pull/1000))
* Improve Backup feature by adding more metadata to saved files ([PR #1016](https://github.com/cozy/cozy-flagship-app/pull/1016))

## 🐛 Bug Fixes

* Client Side Connectors should not appear as errored anymore when stopped by the user ([PR #990](https://github.com/cozy/cozy-flagship-app/pull/990))
* The app should not be hidden behind phone's keyboard anymore when an editable field is selected ([PR #989](https://github.com/cozy/cozy-flagship-app/pull/989) and [PR #1024](https://github.com/cozy/cozy-flagship-app/pull/1024))
* Fix UI bugs ([PR #995](https://github.com/cozy/cozy-flagship-app/pull/995))
* Improve Client Side Connectors stability ([PR #1012](https://github.com/cozy/cozy-flagship-app/pull/1012) and [PR #998](https://github.com/cozy/cozy-flagship-app/pull/998))
* Improve Backup stability ([PR #1003](https://github.com/cozy/cozy-flagship-app/pull/1003), [PR #1019](https://github.com/cozy/cozy-flagship-app/pull/1019), [PR #1020](https://github.com/cozy/cozy-flagship-app/pull/1020) and [PR #1026](https://github.com/cozy/cozy-flagship-app/pull/1026))
* Fix a bug that could produce an app freeze due to GPS running in background ([PR #1015](https://github.com/cozy/cozy-flagship-app/pull/1015))
* Fix a bug that could prevent login by email ([PR #1032](https://github.com/cozy/cozy-flagship-app/pull/1032), [PR #1050](https://github.com/cozy/cozy-flagship-app/pull/1050))

## 🔧 Tech

* Remove `rn-async-storage-flipper` flipper plugin ([PR #1004](https://github.com/cozy/cozy-flagship-app/pull/1004) and [PR #1013](https://github.com/cozy/cozy-flagship-app/pull/1013))
* Add support for XCode 15 ([PR #1008](https://github.com/cozy/cozy-flagship-app/pull/1008))
* Improve documentation for Backup feature ([PR #1011](https://github.com/cozy/cozy-flagship-app/pull/1011))
* Enable CSS vars injection when HttpServer is disabled on dev environment ([PR #997](https://github.com/cozy/cozy-flagship-app/pull/997))
* Migrate some old Javascript code to Typescript ([PR #1010](https://github.com/cozy/cozy-flagship-app/pull/1010))

# 1.1.17

## ✨ Features

* Texts have been translated for Android geolocation notification and geolocation permission ([PR #1005](https://github.com/cozy/cozy-flagship-app/pull/1005))

## 🐛 Bug Fixes

* Icon for Android geolocation notification is correctly shown ([PR #1005](https://github.com/cozy/cozy-flagship-app/pull/1005))

## 🔧 Tech


# 1.1.16

## ✨ Features

* The app can now track geolocation and show CO2 emissions in CoachCO2 app ([PR #973](https://github.com/cozy/cozy-react-native/pull/973), [PR #980](https://github.com/cozy/cozy-flagship-app/pull/980), [PR #981](https://github.com/cozy/cozy-flagship-app/pull/981), [PR #984](https://github.com/cozy/cozy-flagship-app/pull/984), [PR #986](https://github.com/cozy/cozy-flagship-app/pull/986))

## 🐛 Bug Fixes

* Fix error on login authorization check due to missing cookie ([PR #956](https://github.com/cozy/cozy-react-native/pull/956))
* Fix error on login due to webview race condition ([PR #985](https://github.com/cozy/cozy-flagship-app/pull/985))
* Improve destination folder handling on Client Side Connectors ([PR #964](https://github.com/cozy/cozy-react-native/pull/964))
* Client Side Connectors should now correctly set source account for created files ([PR #970](https://github.com/cozy/cozy-react-native/pull/970))
* Push notifications should now open the correct page on the correct webview when clicked ([PR #974](https://github.com/cozy/cozy-react-native/pull/974), [PR #979](https://github.com/cozy/cozy-flagship-app/pull/979))
* Improve album creation handling ([PR #982](https://github.com/cozy/cozy-react-native/pull/982))

## 🔧 Tech

* Add foundations for OCR support ([PR #959](https://github.com/cozy/cozy-react-native/pull/959) and [PR #968](https://github.com/cozy/cozy-react-native/pull/968))
* Improve debug logs for Client Side Connectors ([PR #965](https://github.com/cozy/cozy-react-native/pull/965) and [PR #969](https://github.com/cozy/cozy-react-native/pull/969))
* Add documentation about white labels mechanism ([PR #963](https://github.com/cozy/cozy-react-native/pull/963))
* Change flag name debug.clisk.html-on-error to clisk.html-on-error ([PR #978](https://github.com/cozy/cozy-flagship-app/pull/978))
* Add an isAvailable intent supporting ocr, backup, scanner and geolocationTracking features ([PR #988](https://github.com/cozy/cozy-flagship-app/pull/988))

# 1.1.15

## ✨ Features


## 🐛 Bug Fixes

* Fix SplashScreen logo for Ma Bulle ([PR #961](https://github.com/cozy/cozy-react-native/pull/961))
* Set missing translations for Ma Bulle ([PR #962](https://github.com/cozy/cozy-react-native/pull/962))

## 🔧 Tech


# 1.1.14

## ✨ Features

* Implement email login for OIDC accounts ([PR #949](https://github.com/cozy/cozy-react-native/pull/949))
* Add login authorization check based on the total connected devices for the account ([PR #900](https://github.com/cozy/cozy-react-native/pull/900), [PR #955](https://github.com/cozy/cozy-react-native/pull/955), [PR #954](https://github.com/cozy/cozy-react-native/pull/954) and [PR #954](https://github.com/cozy/cozy-react-native/pull/954))

## 🐛 Bug Fixes

* Fix a bug that can make the app to freeze when running some Client Side Connectors ([PR #932](https://github.com/cozy/cozy-react-native/pull/932))
* Fix a bug that could prevent the SplashScreen to be hiden on app start ([PR #931](https://github.com/cozy/cozy-react-native/pull/931))
* Fix some bugs related to Backup feature ([PR #942](https://github.com/cozy/cozy-react-native/pull/942))
* Fix how file names conflicts are handled in the Backup feature ([PR #950](https://github.com/cozy/cozy-react-native/pull/950))
* Fix a crash that could occurs when resuming the app after a long period of inactivity ([PR #946](https://github.com/cozy/cozy-react-native/pull/946))

## 🔧 Tech

* Add white label mechanism to customize the application ([PR #926](https://github.com/cozy/cozy-react-native/pull/926), [PR #929](https://github.com/cozy/cozy-react-native/pull/929), [PR #933](https://github.com/cozy/cozy-react-native/pull/933), [PR #930](https://github.com/cozy/cozy-react-native/pull/930), [PR #940](https://github.com/cozy/cozy-react-native/pull/940), [PR #936](https://github.com/cozy/cozy-react-native/pull/936), [PR #937](https://github.com/cozy/cozy-react-native/pull/937), [PR #941](https://github.com/cozy/cozy-react-native/pull/941), [PR #939](https://github.com/cozy/cozy-react-native/pull/939), [PR #943](https://github.com/cozy/cozy-react-native/pull/943), [PR #945](https://github.com/cozy/cozy-react-native/pull/945), [PR #948](https://github.com/cozy/cozy-react-native/pull/948), [PR #947](https://github.com/cozy/cozy-react-native/pull/947), [PR #953](https://github.com/cozy/cozy-react-native/pull/953), [PR #944](https://github.com/cozy/cozy-react-native/pull/944) and [PR #957](https://github.com/cozy/cozy-react-native/pull/957))
* Add installation instructions for developpers using M1/M2 macs ([PR #926](https://github.com/cozy/cozy-react-native/pull/926))
* Add foundations for file deduplication in the Backup feature ([PR #951](https://github.com/cozy/cozy-react-native/pull/951))
* Change log level for `checkInitialParam` console alert ([PR #958](https://github.com/cozy/cozy-react-native/pull/958))

# 1.1.13

## ✨ Features


## 🐛 Bug Fixes

* Fix a bug that prevented Client Side Connectors to download files ([PR #902](https://github.com/cozy/cozy-react-native/pull/902))
* Fix a bug that prevented notifications to work on Android 13 ([PR #911](https://github.com/cozy/cozy-flagship-app/pull/911))
* Correctly hide lock screen when navigating to a default cozy-app ([PR #901](https://github.com/cozy/cozy-react-native/pull/901))
* Correctly check log level for Client Side Connectors to avoid crash ([PR #910](https://github.com/cozy/cozy-flagship-app/pull/910))
* Fix a bug where notification permission could lead to a blank screen on Android 13 ([PR #918](https://github.com/cozy/cozy-flagship-app/pull/918))
* Fix FR translations ([PR #922](https://github.com/cozy/cozy-flagship-app/pull/922))

## 🔧 Tech

* Change Android's target SDK from `31` to `33` ([PR #904](https://github.com/cozy/cozy-react-native/pull/904))
* Improve foundations for photo and video backup ([PR #903](https://github.com/cozy/cozy-flagship-app/pull/903), [PR #905](https://github.com/cozy/cozy-flagship-app/pull/905), [PR #908](https://github.com/cozy/cozy-flagship-app/pull/908), [PR #913](https://github.com/cozy/cozy-flagship-app/pull/913), [PR #914](https://github.com/cozy/cozy-flagship-app/pull/914), [PR #915](https://github.com/cozy/cozy-flagship-app/pull/915), [PR #917](https://github.com/cozy/cozy-flagship-app/pull/917), [PR #919](https://github.com/cozy/cozy-flagship-app/pull/919), [PR #920](https://github.com/cozy/cozy-flagship-app/pull/920), [PR #921](https://github.com/cozy/cozy-flagship-app/pull/921), [PR #925](https://github.com/cozy/cozy-flagship-app/pull/925), [PR #928](https://github.com/cozy/cozy-flagship-app/pull/928))
* Improve and rename CI ([PR #923](https://github.com/cozy/cozy-flagship-app/pull/923), [PR #924](https://github.com/cozy/cozy-flagship-app/pull/924))

# 1.1.12

## ✨ Features

* Add localization to login, onboarding and lock screen ([PR #870](https://github.com/cozy/cozy-react-native/pull/870), [PR #872](https://github.com/cozy/cozy-react-native/pull/872), [PR #867](https://github.com/cozy/cozy-react-native/pull/867), [PR #875](https://github.com/cozy/cozy-react-native/pull/875), [PR #881](https://github.com/cozy/cozy-react-native/pull/881) and [PR #892](https://github.com/cozy/cozy-react-native/pull/892))
* Improve UI when displaying errors during login scenario ([PR #877](https://github.com/cozy/cozy-react-native/pull/877))
* The app content is now hiden when navigating to other phone's apps ([PR #894](https://github.com/cozy/cozy-react-native/pull/894))

## 🐛 Bug Fixes

* Blocked and Not Onboarded Cozy are now correctly handled when trying to login ([PR #876](https://github.com/cozy/cozy-react-native/pull/876))
* The app is now redirected to Welcome screen and its content is cleared when the app access is revoked from cozy-settings ([PR #862](https://github.com/cozy/cozy-react-native/pull/862))
* Client Side Connectors now correctly intercept new opened window for login ([PR #884](https://github.com/cozy/cozy-react-native/pull/884))
* Improve support for email and phone links ([PR #890](https://github.com/cozy/cozy-react-native/pull/890))

## 🔧 Tech

* Replace @cozy/minilog with cozy-minilog ([PR #866](https://github.com/cozy/cozy-react-native/pull/866))
* Improve foundations for photo and video backup ([PR #873](https://github.com/cozy/cozy-react-native/pull/873))
* Delay call to `postMessage` on Client Side Connectors initialization ([PR #883](https://github.com/cozy/cozy-react-native/pull/883))
* Add foundations for photo and video backup ([PR #882](https://github.com/cozy/cozy-react-native/pull/882), [PR #885](https://github.com/cozy/cozy-react-native/pull/885) and [PR #887](https://github.com/cozy/cozy-react-native/pull/887))
* Upgrade cozy-client to improve Indexes management ([PR #886](https://github.com/cozy/cozy-react-native/pull/886))
* Improve Client Side Connectors logs and API ([PR #896](https://github.com/cozy/cozy-react-native/pull/896) and [PR #895](https://github.com/cozy/cozy-react-native/pull/895))

# 1.1.11

## ✨ Features


## 🐛 Bug Fixes

* Client Side Connectors now prevent touch interaction during automated phases ([PR #853](https://github.com/cozy/cozy-react-native/pull/853))
* Fix a bug where Client Side Connectors would loss some metadata when running ([PR #864](https://github.com/cozy/cozy-react-native/pull/864))
* Fix a bug that prevented Client Side Connectors to work on iOS ([PR #868](https://github.com/cozy/cozy-react-native/pull/868))

## 🔧 Tech

* Remove unused react-native web setup ([PR #865](https://github.com/cozy/cozy-react-native/pull/865))
* Remove debug.keystore from versioned files and now use the one from Cozy's password-store ([PR #863](https://github.com/cozy/cozy-react-native/pull/863))
* Add foundations for photo and video backup ([PR #871](https://github.com/cozy/cozy-react-native/pull/871))

# 1.1.10

## ✨ Features

* Client Side Connectors now keep the device awake when running to prevent interuption ([PR #840](https://github.com/cozy/cozy-react-native/pull/840))
* Client Side Connectors now download files in a more optimized way ([PR #833](https://github.com/cozy/cozy-react-native/pull/833))

## 🐛 Bug Fixes

* Fix cozy-apps lifecycle ([PR #843](https://github.com/cozy/cozy-react-native/pull/843) and [PR #849](https://github.com/cozy/cozy-react-native/pull/849))
* Cozy-apps icons should now update correctly when switching between multiple Cozy ([PR #852](https://github.com/cozy/cozy-react-native/pull/852))
* The Lock screen shouldn't auto-capitalize the user's password anymore ([PR #854](https://github.com/cozy/cozy-react-native/pull/854))
* The app should be updated in the `Connected device` section as `Application Mobile Cozy` for old sessions ([PR #851](https://github.com/cozy/cozy-react-native/pull/851))
* Fix login issues for OIDC and MagicLink ([PR #860](https://github.com/cozy/cozy-react-native/pull/860))

## 🔧 Tech

* Improve Client Side Connectors logs and API ([PR #846](https://github.com/cozy/cozy-react-native/pull/846) and [PR #850](https://github.com/cozy/cozy-react-native/pull/850))
* Add Flagship app's user-agent on Cloudery webviews to improve debugging ([PR #855](https://github.com/cozy/cozy-react-native/pull/855) and [PR #858](https://github.com/cozy/cozy-react-native/pull/858))

# 1.1.9

## ✨ Features

* The app now appear in the `Connected device` section as `Application Mobile Cozy` and displays the last app usage date ([PR #832](https://github.com/cozy/cozy-react-native/pull/832))

## 🐛 Bug Fixes

* Fix a bug that prevented email links to be opened from cozy-apps ([PR #841](https://github.com/cozy/cozy-react-native/pull/841))
* Status and navigation bar should now adapt to cozy-home theme ([PR #831](https://github.com/cozy/cozy-react-native/pull/831))
* Fix a bug that prevented the app's OS icon to be updated after a login by magic link ([PR #847](https://github.com/cozy/cozy-react-native/pull/847))
* Fix a bug that prevented the app to load after updating the app's OS icon ([PR #847](https://github.com/cozy/cozy-react-native/pull/847))

## 🔧 Tech

* Add keep awake API for future synchronisation service and for Client Side Connectors ([PR #838](https://github.com/cozy/cozy-react-native/pull/838), [PR #839](https://github.com/cozy/cozy-react-native/pull/839), [PR #842](https://github.com/cozy/cozy-react-native/pull/842))

# 1.1.8

## ✨ Features

* Rework onboarding by link and login by link processes to improve compatibility for user with non-default email clients or web browsers ([PR #834](https://github.com/cozy/cozy-flagship-app/pull/834) and [PR #836](https://github.com/cozy/cozy-flagship-app/pull/836))

## 🐛 Bug Fixes

* Improve offline detection when opening cozy-apps ([PR #826](https://github.com/cozy/cozy-flagship-app/pull/826))
* Fix Client Side Connectors stability issues ([PR #818](https://github.com/cozy/cozy-react-native/pull/818))
* Fix a bug that breaks the app when the user click an onboarding link when the app is already connected to an account ([PR #830](https://github.com/cozy/cozy-react-native/pull/830))
* Enforce Light theme on the app to prevent issues on some Android devices ([PR #829](https://github.com/cozy/cozy-react-native/pull/829))

## 🔧 Tech

* Improve Sentry's log reporting ([PR #837](https://github.com/cozy/cozy-react-native/pull/837))

# 1.1.7

## 🐛 Bug Fixes

* Ensure that the user can't go back to the home from a LockScreen/Pin/Password view [PR #824](https://github.com/cozy/cozy-flagship-app/pull/824)

# 1.1.6

## 🐛 Bug Fixes

* Ensure that the splashscreen doesn't hide early on the homescreen [PR #820](https://github.com/cozy/cozy-flagship-app/pull/820)
* Add round mabulle icon for Android [PR #822](https://github.com/cozy/cozy-flagship-app/pull/822)

# 1.1.5

## ✨ Features

* Display a modal to show when app icon changed [PR #816](https://github.com/cozy/cozy-flagship-app/pull/816)
* Customize default icon remotely [PR #816](https://github.com/cozy/cozy-flagship-app/pull/816)

## 🐛 Bug Fixes

* Ensure that the Application splash screen is correctly hidden in all scenarios [PR #819](https://github.com/cozy/cozy-flagship-app/pull/819)

# 1.1.4

## ✨ Features

* Upgrade cozy-clisk to `0.13.0` to get subPath [PR #814](https://github.com/cozy/cozy-flagship-app/pull/814)

## 🐛 Bug Fixes

* Enhancing app lockingmechanism and handling edge cases by @acezard [PR #815](https://github.com/cozy/cozy-flagship-app/pull/815)
* Set launcherview header to display dark icons on white background [PR #817](https://github.com/cozy/cozy-flagship-app/pull/817)

# 1.1.3

## ✨ Features


## 🐛 Bug Fixes

* Fix UI issues on password and PIN prompts ([PR #799](https://github.com/cozy/cozy-react-native/pull/799), [PR #801](https://github.com/cozy/cozy-react-native/pull/801), [PR #805](https://github.com/cozy/cozy-react-native/pull/805), [PR #806](https://github.com/cozy/cozy-react-native/pull/806), [PR #807](https://github.com/cozy/cozy-react-native/pull/807) and [PR #808](https://github.com/cozy/cozy-react-native/pull/808))
* Fix a bug that prevented CLient Side Connectors logs to be handled correctly ([PR #802](https://github.com/cozy/cozy-react-native/pull/802))
* Document scanning now correctly returns the last scan when multiple tries are done ([PR #803](https://github.com/cozy/cozy-react-native/pull/803))

## 🔧 Tech

* Update `cozy-clisk` to `0.12.2` ([PR #800](https://github.com/cozy/cozy-react-native/pull/800))
* Improve developers documentation ([PR #784](https://github.com/cozy/cozy-react-native/pull/784))

# 1.1.2

## ✨ Features

* The app will now drive the user to set a password or a PIN code if their phone is not secured ([PR #788](https://github.com/cozy/cozy-react-native/pull/788))

## 🐛 Bug Fixes

* Fix Client Side Connectors stability issues ([PR #791](https://github.com/cozy/cozy-react-native/pull/791) and [PR #793](https://github.com/cozy/cozy-react-native/pull/793))
* Fix error when trying to get notification for an on-premise Cozy ([PR #790](https://github.com/cozy/cozy-react-native/pull/790))
* Fix a bug that displayed some button too close to the screen's borders on small screens ([PR #792](https://github.com/cozy/cozy-react-native/pull/792))

## 🔧 Tech

* Add foundations for document scanning capabilities ([PR #783](https://github.com/cozy/cozy-react-native/pull/783) and [PR #795](https://github.com/cozy/cozy-react-native/pull/795))
* Add configuration for debuging on a real iOS device ([PR #773](https://github.com/cozy/cozy-react-native/pull/773))

# 1.1.1

## ✨ Features


## 🐛 Bug Fixes

* Fix Client Side Connectors stability issues ([PR #777](https://github.com/cozy/cozy-react-native/pull/777) and [PR #781](https://github.com/cozy/cozy-react-native/pull/781))
* Show a loading screen after opening a MagicLink and until the login is complete ([PR #785](https://github.com/cozy/cozy-react-native/pull/785))
* Fix an app crash that happens on some devices on Onboarding end ([PR #787](https://github.com/cozy/cozy-react-native/pull/787))

## 🔧 Tech


# 1.1.0

## ✨ Features

* Improve login and onboarding screens theming capabilities for our partners ([PR #776](https://github.com/cozy/cozy-react-native/pull/776))
* Logout locally configured Client Side Connectors when they are removed from another device ([PR #748](https://github.com/cozy/cozy-react-native/pull/748))

## 🐛 Bug Fixes

* Fix some scenario where the status bar was not displayed with the correct color ([PR #775](https://github.com/cozy/cozy-react-native/pull/775))

## 🔧 Tech

* Change OS icon for `mespapiers` app ([PR #778](https://github.com/cozy/cozy-react-native/pull/778))
* Remove UINewsstandIcon from Info.plist ([PR #780](https://github.com/cozy/cozy-react-native/pull/780))

# 1.0.10

## ✨ Features


## 🐛 Bug Fixes

* Fix a bug that prevented a Connector to be opened from cozy-store ([PR #766](https://github.com/cozy/cozy-react-native/pull/766))
* Fix a bug that would re-send a new 2FA email every time the user enters the wrong 2FA code on OIDC login ([PR #767](https://github.com/cozy/cozy-react-native/pull/767))

## 🔧 Tech


# 1.0.9

## ✨ Features


## 🐛 Bug Fixes

* Fix a bug that displays some menus in English even if the phone is configured in French ([PR #756](https://github.com/cozy/cozy-react-native/pull/756))
* Fix a bug that prevents login with OIDC or with manual Flagship certification on Android ([PR #758](https://github.com/cozy/cozy-react-native/pull/758))
* Fix a bug that changes the app's icon too often on iOS ([PR #759](https://github.com/cozy/cozy-react-native/pull/759))
* Fix a bug that crashed the app when canceling MagicLink login ([PR #762](https://github.com/cozy/cozy-react-native/pull/762))

## 🔧 Tech

* Login and Onboarding scenario now automatically handle unsecure HTTP protocol on `cozy.tools`, `localhost` and `nip.io` domains ([PR #757](https://github.com/cozy/cozy-react-native/pull/757) and [PR #763](https://github.com/cozy/cozy-react-native/pull/763))

# 1.0.8

## ✨ Features

* It is now possible to set default startup app from cozy-settings ([PR #682](https://github.com/cozy/cozy-react-native/pull/682), [PR #687](https://github.com/cozy/cozy-react-native/pull/687), [PR #693](https://github.com/cozy/cozy-react-native/pull/693), [PR #696](https://github.com/cozy/cozy-react-native/pull/696), [PR #729](https://github.com/cozy/cozy-react-native/pull/729) and [PR #744](https://github.com/cozy/cozy-react-native/pull/744))
* It is now possible to create a Cozy Pass vault from this app ([PR #705](https://github.com/cozy/cozy-react-native/pull/705))
* The Login UI has been reworked ([PR #700](https://github.com/cozy/cozy-react-native/pull/700))
* It is now possible to login from our parteners accounts ([PR #700](https://github.com/cozy/cozy-react-native/pull/700))
* It is now possible to create a cozy and then to log to it by using an email instead of a password thanks to Magic Links ([PR #700](https://github.com/cozy/cozy-react-native/pull/700))
* The app has been renamed from `Cozy Cloud` to `Cozy` ([PR #735](https://github.com/cozy/cozy-react-native/pull/735) and [PR #752](https://github.com/cozy/cozy-react-native/pull/752))

## 🐛 Bug Fixes

* Fix a bug that prevents to download bills from cozy-banks ([PR #680](https://github.com/cozy/cozy-react-native/pull/680))
* Fix Client Side Connectors stability issues ([PR #683](https://github.com/cozy/cozy-react-native/pull/683), [PR #685](https://github.com/cozy/cozy-react-native/pull/685), [PR #692](https://github.com/cozy/cozy-react-native/pull/692), [PR #697](https://github.com/cozy/cozy-react-native/pull/697), [PR #703](https://github.com/cozy/cozy-react-native/pull/703), [PR #704](https://github.com/cozy/cozy-react-native/pull/704), [PR #706](https://github.com/cozy/cozy-react-native/pull/706), [PR #709](https://github.com/cozy/cozy-react-native/pull/709), [PR #710](https://github.com/cozy/cozy-react-native/pull/710), [PR #724](https://github.com/cozy/cozy-react-native/pull/724), [PR #726](https://github.com/cozy/cozy-react-native/pull/726) and [PR #751](https://github.com/cozy/cozy-react-native/pull/751))
* Received notifications now have the correct icon ([PR #688](https://github.com/cozy/cozy-react-native/pull/688))
* Fix a bug that prevents Android app to be opened from Cozy links ([PR #702](https://github.com/cozy/cozy-react-native/pull/702))
* Fix stability issues on Login and Logout scenario ([PR #707](https://github.com/cozy/cozy-react-native/pull/707), [PR #720](https://github.com/cozy/cozy-react-native/pull/720) and [PR #721](https://github.com/cozy/cozy-react-native/pull/721))
* Fix a bug that displays some menus in English even if the phone is configured in French ([PR #749](https://github.com/cozy/cozy-react-native/pull/749))

## 🔧 Tech

* Fixing metadata deduplication by upgrading cozy-clisk ([PR #684](https://github.com/cozy/cozy-react-native/pull/684))
* Matches project structure more closely compared to fresh 0.66.4 install ([PR #661](https://github.com/cozy/cozy-react-native/pull/661))
* Add instructions to build app on dev environment ([PR #689](https://github.com/cozy/cozy-react-native/pull/689))
* Add logs to ease debuging ([PR #694](https://github.com/cozy/cozy-react-native/pull/694), [PR #699](https://github.com/cozy/cozy-react-native/pull/699) and [PR #732](https://github.com/cozy/cozy-react-native/pull/732))
* Use redirectLink in notification instead of separate values ([PR #695](https://github.com/cozy/cozy-react-native/pull/695) and [PR #701](https://github.com/cozy/cozy-react-native/pull/701))
* Continuous Integration is now triggered on every PRs ([PR #723](https://github.com/cozy/cozy-react-native/pull/723))
* Prevent queries to FirebaseLogging that appeared after implementing the Notification system ([PR #739](https://github.com/cozy/cozy-react-native/pull/739))
* Split `client.js` into multiple files and add TS typing on them  ([PR #734](https://github.com/cozy/cozy-react-native/pull/734))

# 1.0.7

## ✨ Features

* Improve Client Side Connectors performance when downloading files ([PR #633](https://github.com/cozy/cozy-react-native/pull/633))

## 🐛 Bug Fixes

* Fix a bug that makes Client Side Connectors hang after initialization ([PR #652](https://github.com/cozy/cozy-react-native/pull/652))
* Fix a bug that prevents Client Side Connectors to stop if the user cancel the login step ([PR #659](https://github.com/cozy/cozy-react-native/pull/659))
* Cozy's font is now correcly used on Welcome and Error screens ([PR #669](https://github.com/cozy/cozy-react-native/pull/669))

## 🔧 Tech

* Add performance logs on Client Side Connectors execution ([PR #668](https://github.com/cozy/cozy-react-native/pull/668))
* Add foundations for OnboardingPartner onboarding ([PR #655](https://github.com/cozy/cozy-react-native/pull/655))
* Prevent code injection on Password screen ([PR #672](https://github.com/cozy/cozy-react-native/pull/672))

# 1.0.6

## ✨ Features

* Client Side Connectors now display a "loading" screen until they are initialized ([PR #647](https://github.com/cozy/cozy-react-native/pull/647))
* The App now redirects to the urser's default cozy-app on startup ([PR #653](https://github.com/cozy/cozy-react-native/pull/653) and [PR #650](https://github.com/cozy/cozy-react-native/pull/650))

## 🐛 Bug Fixes

* Fix a bug that prevented cozy-home to be updated ([PR #651](https://github.com/cozy/cozy-react-native/pull/651))
* Fix some scenario where the status bar was not displayed with the correct color ([PR #657](https://github.com/cozy/cozy-react-native/pull/657))
* Fix a bug that prevented Client Side Connectors to be openned from cozy-store ([PR #656](https://github.com/cozy/cozy-react-native/pull/656))
* Improve Client Side Connectors life-cycle ([PR #649](https://github.com/cozy/cozy-react-native/pull/649), [PR #636](https://github.com/cozy/cozy-react-native/pull/636), [PR #662](https://github.com/cozy/cozy-react-native/pull/662) and [PR #663](https://github.com/cozy/cozy-react-native/pull/663))

## 🔧 Tech

* Remove Client Side Connectors specific code since it has been moved into Clisk library ([PR #640](https://github.com/cozy/cozy-react-native/pull/640))
* Fix casing in install:home script ([PR #625](https://github.com/cozy/cozy-react-native/pull/625))
* Implement OnboardingPartner and ClouderyEnv override using links ([PR #654](https://github.com/cozy/cozy-react-native/pull/654))
* Add documentation about Android debug with new variants ([PR #664](https://github.com/cozy/cozy-react-native/pull/664))

# 1.0.5

## ✨ Features


## 🐛 Bug Fixes

* Fix a bug that prevented cozy-home to be updated to latest version ([PR #639](https://github.com/cozy/cozy-react-native/pull/639))

## 🔧 Tech

* Add shell script to reset Android development environment ([PR #637](https://github.com/cozy/cozy-react-native/pull/637))
* Fix a bug that prevented to update local cozy-app bundles on Android from a local development environment ([PR #638](https://github.com/cozy/cozy-react-native/pull/638))
* Update ESLint config ([PR #646](https://github.com/cozy/cozy-react-native/pull/646))
* Add foundations for `onboarded_redirection` param handling on Onbarding scenario ([PR #635](https://github.com/cozy/cozy-react-native/pull/635))

# 1.0.4

## ✨ Features

* The App can now receive notifications from the user's Cozy ([PR #594](https://github.com/cozy/cozy-react-native/pull/594))

## 🐛 Bug Fixes

* Fix a bug that prevented Connectors to be opened from cozy-store ([PR #618](https://github.com/cozy/cozy-react-native/pull/618))
* Canceling login step when executin a Client Side Connector doesn't block the connector anymore ([PR #607](https://github.com/cozy/cozy-react-native/pull/607), [PR #630](https://github.com/cozy/cozy-react-native/pull/630) and [PR #631](https://github.com/cozy/cozy-react-native/pull/631))

## 🔧 Tech

* Client Side Connectors execution duration is now limited to 15min ([PR #571](https://github.com/cozy/cozy-react-native/pull/571))
* Use cache for fetch apps query ([PR #597](https://github.com/cozy/cozy-react-native/pull/597))
* Fix ESLint warnings ([PR #602](https://github.com/cozy/cozy-react-native/pull/602))
* Extract Client Side Connectors code into `cozy-clisk` library ([PR #599](https://github.com/cozy/cozy-react-native/pull/599) and [PR #621](https://github.com/cozy/cozy-react-native/pull/621))
* Increase default `PBKDF2` iteration number to from `100000` to `650000` ([PR #606](https://github.com/cozy/cozy-react-native/pull/606))
* Fix URL interception for Cozys with nested domain configuration ([PR #619](https://github.com/cozy/cozy-react-native/pull/619))
* Remove dependency to cozy-ui ([PR #609](https://github.com/cozy/cozy-react-native/pull/609))
* Use `cozy-tsconfig` for Typescript configuration ([PR #627](https://github.com/cozy/cozy-react-native/pull/627))
* Homogenize `Konnector/Connector` naming convention by using only `Konnector` ([PR #617](https://github.com/cozy/cozy-react-native/pull/617))
* Add foundations for OnboardingPartner context interception ([PR #632](https://github.com/cozy/cozy-react-native/pull/632))

# 1.0.3

## ✨ Features

* Improve Client Side Connectors security by enforcint limited permissions ([PR #558](https://github.com/cozy/cozy-react-native/pull/558))

## 🐛 Bug Fixes

* Prevent multiple Client Side Connectors to be executed simultaneously ([PR #572](https://github.com/cozy/cozy-react-native/pull/572))
* Clean Client Side Connectors state on app startup ([PR #579](https://github.com/cozy/cozy-react-native/pull/579))
* Shared cozy-notes are now correctly displayed ([PR #596](https://github.com/cozy/cozy-react-native/pull/596))

## 🔧 Tech

* Client Side Connectors can now send execution logs to the cozy-stack ([PR #516](https://github.com/cozy/cozy-react-native/pull/516), [PR #534](https://github.com/cozy/cozy-react-native/pull/534) and [PR #593](https://github.com/cozy/cozy-react-native/pull/593))
* Client Side Connectors now have an API to normalize files names ([PR #462](https://github.com/cozy/cozy-react-native/pull/462))
* App's environment variables are now handled by `.env` file ([PR #557](https://github.com/cozy/cozy-react-native/pull/557))
* Improve dev environement setup ([PR #562](https://github.com/cozy/cozy-react-native/pull/562))
* Client Side Connectors library has been moved into a dedicated repository ([PR #559](https://github.com/cozy/cozy-react-native/pull/559), [PR #560](https://github.com/cozy/cozy-react-native/pull/560) and [PR #555](https://github.com/cozy/cozy-react-native/pull/555))
* Client Side Connectors have been moved into their dedicated repositories ([PR #565](https://github.com/cozy/cozy-react-native/pull/565))
* Fix build error related to `jetified-kotlin-stdlib` ([PR #566](https://github.com/cozy/cozy-react-native/pull/566))
* Fix build error related to `hermes` ([PR #580](https://github.com/cozy/cozy-react-native/pull/580))
* Add CI workflows ([PR #551](https://github.com/cozy/cozy-react-native/pull/551), [PR #570](https://github.com/cozy/cozy-react-native/pull/570), [PR #547](https://github.com/cozy/cozy-react-native/pull/547), [PR #584](https://github.com/cozy/cozy-react-native/pull/584), [PR #554](https://github.com/cozy/cozy-react-native/pull/554) and [PR #620](https://github.com/cozy/cozy-react-native/pull/620))
* Rework app startup algorithms ([PR #550](https://github.com/cozy/cozy-react-native/pull/550))
* Add foundations for push notifications ([PR #598](https://github.com/cozy/cozy-react-native/pull/598))

# 1.0.2

## ✨ Features

* Client Side Connectors can now be installed from Registry ([PR #525](https://github.com/cozy/cozy-react-native/pull/525))
* Client Side Connectors are now executed using a permission-limited Client ([PR #533](https://github.com/cozy/cozy-react-native/pull/533))

## 🐛 Bug Fixes

* Fix CozyApp opening animation that was using the wrong screen's width & height calculation ([PR #545](https://github.com/cozy/cozy-react-native/pull/545))

## 🔧 Tech

* Reworked project file structure ([PR #535](https://github.com/cozy/cozy-react-native/pull/535), [PR #541](https://github.com/cozy/cozy-react-native/pull/541) and [PR #546](https://github.com/cozy/cozy-react-native/pull/546))
* Convert `Template` Client Side Connector to use HTTPS instead of HTTP ([PR #539](https://github.com/cozy/cozy-react-native/pull/539))
* Local HttpServer now supports `{.CozyFonts}` template tag ([PR #543](https://github.com/cozy/cozy-react-native/pull/543))
* Prevents phone numbers to be send to Sentry when handling related errors ([PR #544](https://github.com/cozy/cozy-react-native/pull/544))

# 1.0.1

## ✨ Features


## 🐛 Bug Fixes

* File-viewer is now correctly hidden by Lock screen on iOS ([PR #501](https://github.com/cozy/cozy-react-native/pull/501) and [PR #523](https://github.com/cozy/cozy-react-native/pull/523))
* Correctly display file name in file-viewer ([PR #502](https://github.com/cozy/cozy-react-native/pull/502))
* The "in page" Back button on password reset page is now hidden when displayed on Flagship app ([PR #512](https://github.com/cozy/cozy-react-native/pull/512))
* The app is now compatible with Android 5.1+ as we fixed the GZip library implementation ([PR #511](https://github.com/cozy/cozy-react-native/pull/511))
* Fix cookie management for `Alan` Client Side Connector ([PR #510](https://github.com/cozy/cozy-react-native/pull/510))
* The Lock screen password input now uses the correct caret color ([PR #524](https://github.com/cozy/cozy-react-native/pull/524))
* Margins for handling navigation bar and status bar sizes should now be computed correctly on a wider device range ([PR #514](https://github.com/cozy/cozy-react-native/pull/514))

## 🔧 Tech

* Navigation bar and status bar Color API now allow to set different text colors on each bars ([PR #513](https://github.com/cozy/cozy-react-native/pull/513))
* `handleOffline()` now explicitly includes a callbackRoute ([PR #515](https://github.com/cozy/cozy-react-native/pull/515))
* Migrate `HomeScreen` code to TypeScript ([PR #531](https://github.com/cozy/cozy-react-native/pull/531))

# 1.0.0

## ✨ Features


## 🐛 Bug Fixes


## 🔧 Tech

* Bump app version to `1.0.0` for release publication ([PR #509](https://github.com/cozy/cozy-react-native/pull/509))

# 0.0.33

## ✨ Features


## 🐛 Bug Fixes

* Fix a bug that prevented the app to logout ([PR #498](https://github.com/cozy/cozy-react-native/pull/498))

## 🔧 Tech

* Improve dev documentation about debugging from an Android emulator ([PR #499](https://github.com/cozy/cozy-react-native/pull/499))

# 0.0.32

## ✨ Features


## 🐛 Bug Fixes

* Improve autolock pairing with biometry/pinCode ([PR #493](https://github.com/cozy/cozy-react-native/pull/493))
* Offline boot now correctly redirect to Offline screen ([PR #496](https://github.com/cozy/cozy-react-native/pull/496))

## 🔧 Tech

* Improve Typescript typing ([PR #472](https://github.com/cozy/cozy-react-native/pull/472) and [PR #495](https://github.com/cozy/cozy-react-native/pull/495))

# 0.0.31

## ✨ Features

* The connectivity checks are now targeting the Cozy server instead of Google's ones ([PR #470](https://github.com/cozy/cozy-react-native/pull/470) and [PR #479](https://github.com/cozy/cozy-react-native/pull/479))
* Improve Client Side Connectors API by allowing connectors to manipulate related Cookies ([PR #460](https://github.com/cozy/cozy-react-native/pull/460))
* Lock screen UI is now using the Cozy's system font ([PR #485](https://github.com/cozy/cozy-react-native/pull/485))

## 🐛 Bug Fixes

* Prevent the app to crash when trying to open an email link but no email client is set on the Android phone ([PR #473](https://github.com/cozy/cozy-react-native/pull/473))
* Re-apply user's session when App resumes ([PR #468](https://github.com/cozy/cozy-react-native/pull/468))
* Only serve approved cozy-apps through HttpServer ([PR #486](https://github.com/cozy/cozy-react-native/pull/486))
* Fix a bug that prevented to open PDF on latest Android versions ([PR #477](https://github.com/cozy/cozy-react-native/pull/477))
* Fix a bug that could crash the App when opening an in-app browser ([PR #477](https://github.com/cozy/cozy-react-native/pull/477))
* Fix a bug that could crash the App when accessing `caller.name` JS API ([PR #489](https://github.com/cozy/cozy-react-native/pull/489))
* Correctly handle Offline detection when opening the App ([PR #488](https://github.com/cozy/cozy-react-native/pull/488))

## 🔧 Tech

* Upgrade testing environment ([PR #471](https://github.com/cozy/cozy-react-native/pull/471))
* Fix build that was breaking due to incorrect import ([PR #476](https://github.com/cozy/cozy-react-native/pull/476))
* Add documentation about `PhaseScriptExecution failed` build error in Troubleshooting section ([PR #450](https://github.com/cozy/cozy-react-native/pull/450))
* Improve release process by generating the Home embedded bundle using the Cozy's Registry ([PR #478](https://github.com/cozy/cozy-react-native/pull/478))
* Homogenise AsyncStorage keys ([PR #487](https://github.com/cozy/cozy-react-native/pull/487))

# 0.0.30

## ✨ Features

* Handle iOS authorization for FaceID ([PR #457](https://github.com/cozy/cozy-react-native/pull/457))
* Add confirmation dialog when login out from Lock screen ([PR #467](https://github.com/cozy/cozy-react-native/pull/467))

## 🐛 Bug Fixes

* Fix imported files naming format (date) for `TotalEnergie` Client Side Connectors ([PR #461](https://github.com/cozy/cozy-react-native/pull/461))
* Autolock is not automatically disabled anymore when Biometry is disabled ([PR #459](https://github.com/cozy/cozy-react-native/pull/459))
* Correctly handle status bar and navigation bar colors on Lock screen ([PR #458](https://github.com/cozy/cozy-react-native/pull/458))
* Prevent app to be instantaneously locked when opening a file from cozy-drive ([PR #465](https://github.com/cozy/cozy-react-native/pull/465))
* Fix a scenario where the Offline error screen was blank ([PR #469](https://github.com/cozy/cozy-react-native/pull/469))

## 🔧 Tech


# 0.0.29

## ✨ Features

* Add unlock by PIN feature ([PR #432](https://github.com/cozy/cozy-react-native/pull/432))
* Improve Lock Screen UI ([PR #442](https://github.com/cozy/cozy-react-native/pull/442))
* Add `Veolia Eau` in Client Side Connectors ([PR #430](https://github.com/cozy/cozy-react-native/pull/430))
* Add `Gaz Tarif Réglementé` in Client Side Connectors ([PR #437](https://github.com/cozy/cozy-react-native/pull/437))

## 🐛 Bug Fixes

* Fix bugs related to lock/unlock feature ([PR #441](https://github.com/cozy/cozy-react-native/pull/441) and [PR #453](https://github.com/cozy/cozy-react-native/pull/453))
* Fix `TotalEnergie` Client Side Connectors ([PR #448](https://github.com/cozy/cozy-react-native/pull/448))
* Fix app crash when opening a cozy-app ([PR #449](https://github.com/cozy/cozy-react-native/pull/449))

## 🔧 Tech

* Improve project's documentation about Java JDK requirement ([PR #447](https://github.com/cozy/cozy-react-native/pull/447))
* Improve project's documentation about Sentry configuration ([PR #445](https://github.com/cozy/cozy-react-native/pull/445))
* Force `androidXBrowser` version to 1.4.0 ([PR #446](https://github.com/cozy/cozy-react-native/pull/446))
* Add `Hermes` to iOS linked libraries ([PR #451](https://github.com/cozy/cozy-react-native/pull/451))

# 0.0.28

## ✨ Features


## 🐛 Bug Fixes

* Fix iOS FaceID crash due to missing permissions declaration ([PR #435](https://github.com/cozy/cozy-react-native/pull/435))

## 🔧 Tech

* Activate Hermes engine ([PR #260](https://github.com/cozy/cozy-react-native/pull/260))

# 0.0.27

## ✨ Features

* Add auto-lock when app goes to background ([PR #415](https://github.com/cozy/cozy-react-native/pull/415))
* Add biometric lock/unlock feature ([PR #402](https://github.com/cozy/cozy-react-native/pull/402) and [PR #428](https://github.com/cozy/cozy-react-native/pull/428) and [PR #433](https://github.com/cozy/cozy-react-native/pull/433))
* Add `Red` in Client Side Connectors ([PR #372](https://github.com/cozy/cozy-react-native/pull/372))
* Add `Sfr` in Client Side Connectors ([PR #375](https://github.com/cozy/cozy-react-native/pull/375))
* Add `TotalEnergie` in Client Side Connectors ([PR #390](https://github.com/cozy/cozy-react-native/pull/390))
* Add `AlanConnector` in Client Side Connectors ([PR #421](https://github.com/cozy/cozy-react-native/pull/421))
* Add `Orange` in Client Side Connectors ([PR #254](https://github.com/cozy/cozy-react-native/pull/254))
* Add autologin on `Sosh` Client Side Connector ([PR #299](https://github.com/cozy/cozy-react-native/pull/299))

## 🐛 Bug Fixes

* Correctly embed URL in Android's Share feature ([PR #417](https://github.com/cozy/cozy-react-native/pull/417))
* Correctly re-set user's session when the app is resumed after a long period of inactivity ([PR #427](https://github.com/cozy/cozy-react-native/pull/427) and [PR #425](https://github.com/cozy/cozy-react-native/pull/425))
* Disable HttpServer optimisation for cozy-settings that would prevent this cozy-app to work on iOS ([PR #416](https://github.com/cozy/cozy-react-native/pull/416))

## 🔧 Tech

* Remove some UI unnecessary re-renders ([PR #423](https://github.com/cozy/cozy-react-native/pull/423) and [PR #424](https://github.com/cozy/cozy-react-native/pull/424))
* Handle HttpServer deactivation in unit-tests ([PR #426](https://github.com/cozy/cozy-react-native/pull/426))
* Improve file upload API for Client Side Connectors ([PR #422](https://github.com/cozy/cozy-react-native/pull/422))

# 0.0.26

## ✨ Features


## 🐛 Bug Fixes

* Correctly open external links into InApp Browser ([PR #412](https://github.com/cozy/cozy-react-native/pull/412))

## 🔧 Tech


# 0.0.25

## ✨ Features

* Intercept downloads on iOS and open QuickLook instead ([PR #399](https://github.com/cozy/cozy-react-native/pull/399))
* Intercept PDF downloads on Android and open FileViewer instead ([PR #399](https://github.com/cozy/cozy-react-native/pull/399))
* Add support for Android's Share feature ([PR #406](https://github.com/cozy/cozy-react-native/pull/406))

## 🐛 Bug Fixes

* Correctly handle RefreshTokens queries on Android ([PR #404](https://github.com/cozy/cozy-react-native/pull/404))

## 🔧 Tech


# 0.0.24

## ✨ Features


## 🐛 Bug Fixes

* Correctly handle external links (i.e. help link, shortcuts) ([PR #391](https://github.com/cozy/cozy-react-native/pull/391) and [PR #396](https://github.com/cozy/cozy-react-native/pull/396))
* Delete existing version folder if exists when updating a cozy-app to prevent corrupted artifacts after an update error ([PR #392](https://github.com/cozy/cozy-react-native/pull/392))

## 🔧 Tech

* Disable Client Side Connectors ([PR #381](https://github.com/cozy/cozy-react-native/pull/381))
* Handle cozy-client's injected capabilities as object ([PR #386](https://github.com/cozy/cozy-react-native/pull/386))
* Log errors in catch statements ([PR #387](https://github.com/cozy/cozy-react-native/pull/387))

# 0.0.23

## ✨ Features


## 🐛 Bug Fixes

* Intercept outgoing navigation on Android ([PR #385](https://github.com/cozy/cozy-react-native/pull/385))

## 🔧 Tech

* Remove unused libraries ([PR #379](https://github.com/cozy/cozy-react-native/pull/379) and [PR #380](https://github.com/cozy/cozy-react-native/pull/380))

# 0.0.22

## ✨ Features

* Add autologin on `Amazon` Client Side Connector ([PR #357](https://github.com/cozy/cozy-react-native/pull/357))
* Use production URL for ClouderyView ([PR #371](https://github.com/cozy/cozy-react-native/pull/371))

## 🐛 Bug Fixes

* Auto-remount WebView when killed by iOS memory management ([PR #352](https://github.com/cozy/cozy-react-native/pull/352))
* Fix OAuth client name ([PR #365](https://github.com/cozy/cozy-react-native/pull/365))
* Fix synchronization problem when navigating from a cozy-app to another ([PR #374](https://github.com/cozy/cozy-react-native/pull/374) and [PR #383](https://github.com/cozy/cozy-react-native/pull/383))

## 🔧 Tech

* Add documentation for debuging `cozy-bar` ([PR #341](https://github.com/cozy/cozy-react-native/pull/341))
* Migrate `setFlagshipUI()` code to TypeScript ([PR #358](https://github.com/cozy/cozy-react-native/pull/358))
* Improve `FlagshipUI` behaviour ([PR #362](https://github.com/cozy/cozy-react-native/pull/362))
* Add commented code as a suggestion to make Android project compilable on Windows ([PR #359](https://github.com/cozy/cozy-react-native/pull/359))
* Initialize Client Side Connector's store on connector startup ([PR #354](https://github.com/cozy/cozy-react-native/pull/354))
* Add documentation for debuging local application using hot-reload ([PR #361](https://github.com/cozy/cozy-react-native/pull/361))
* Intercept WebView reload on iOS ([PR #370](https://github.com/cozy/cozy-react-native/pull/370) and [PR #382](https://github.com/cozy/cozy-react-native/pull/382))

# 0.0.21

## ✨ Features

* Set OAuth client name in the form of `Cloud personnel (device name)` to ease identification in cozy-settings ([PR #351](https://github.com/cozy/cozy-react-native/pull/351))

## 🐛 Bug Fixes

* Make navigation work on `mespapiers` ([PR #350](https://github.com/cozy/cozy-react-native/pull/350))

## 🔧 Tech

* Improve performance when displaying Login screen after the Welcome ([PR #347](https://github.com/cozy/cozy-react-native/pull/347))
* Set Cozy's UserAgents to all requests to easy technical logging ([PR #349](https://github.com/cozy/cozy-react-native/pull/349))


# 0.0.20

## ✨ Features

* Improve `Amazon` Client Side Connector by persisting credentials and user session ([PR #338](https://github.com/cozy/cozy-react-native/pull/338))

## 🐛 Bug Fixes

* Set blue background on PasswordView to prevent white flash in some scenario ([PR #342](https://github.com/cozy/cozy-react-native/pull/342))
* Fix crash on iOS app start ([PR #344](https://github.com/cozy/cozy-react-native/pull/344))
* Fix style issues on iOS due to incorrect `isMobile` detection ([PR #346](https://github.com/cozy/cozy-react-native/pull/346))
* Fix style margins for cozy-apps views that should have been applied only on the cozy-home view ([PR #345](https://github.com/cozy/cozy-react-native/pull/345))
* Correctly store new client's token in the device after a refreshToken ([PR #313](https://github.com/cozy/cozy-react-native/pull/313))

## 🔧 Tech


# 0.0.19

## ✨ Features


## 🐛 Bug Fixes

* Improve `closeApp` mechanism to avoid race condition with handshake from cozy-app view ([PR #336](https://github.com/cozy/cozy-react-native/pull/336))

## 🔧 Tech

* Add new `forceHideSplashScreen` option in dev config ([PR #333](https://github.com/cozy/cozy-react-native/pull/333))
* Remove custom `flow()` implementation ([PR #339](https://github.com/cozy/cozy-react-native/pull/339))
* Add guide for debugging app in Release mode ([PR #340](https://github.com/cozy/cozy-react-native/pull/340))

# 0.0.18

## ✨ Features

* Improve UI for `close` button in connectors' launcher ([PR #329](https://github.com/cozy/cozy-react-native/pull/329))

## 🐛 Bug Fixes

* Prevent UI flickering in cozy-home by injecting CSS in the WebView ([PR #321](https://github.com/cozy/cozy-react-native/pull/321))
* Remove supernumerary question mark from clouderyiOSUri ([PR #327](https://github.com/cozy/cozy-react-native/pull/327))

## 🔧 Tech

* Specify correct stack routes when app bootstraps ([PR #331](https://github.com/cozy/cozy-react-native/pull/331))
* Enable Typescript support ([PR #322](https://github.com/cozy/cozy-react-native/pull/322))

# 0.0.17

## ✨ Features


## 🐛 Bug Fixes

* Prevent UI flickering in cozy-home by injecting CSS in the WebView ([PR #318](https://github.com/cozy/cozy-react-native/pull/318))

## 🔧 Tech


# 0.0.16

## ✨ Features


## 🐛 Bug Fixes

* iOS Status bar stop disappearing when focus on konnector input text ([PR #306](https://github.com/cozy/cozy-react-native/pull/306))
* Wait 1 ms to display ClouderyView Overlay to prevent flash white screen ([PR #308](https://github.com/cozy/cozy-react-native/pull/308))
* Fallback to cozy-stack version when index.html failed to be created ([PR #303](https://github.com/cozy/cozy-react-native/pull/303))
* Handle tar_prefix when downloading cozy-app bundles ([PR #305](https://github.com/cozy/cozy-react-native/pull/305))
* Fix Android's login that was prevented by wrong intent schemees configuration ([PR #309](https://github.com/cozy/cozy-react-native/pull/309))
* Fix Android's onboarding by using old scheme instead of UniversalLink ([PR #317](https://github.com/cozy/cozy-react-native/pull/317))

## 🔧 Tech

* Clear lint warnings ([PR #307](https://github.com/cozy/cozy-react-native/pull/307))
* Follow react-hooks/exhaustive-deps and no-shadow ([PR #310](https://github.com/cozy/cozy-react-native/pull/310))
* Improve test code ([PR #311](https://github.com/cozy/cozy-react-native/pull/311) and [PR #312](https://github.com/cozy/cozy-react-native/pull/312))

# 0.0.15

## ✨ Features

* Improve cozy-app opening animation and add a progress bar ([PR #290](https://github.com/cozy/cozy-react-native/pull/290) and [PR #295](https://github.com/cozy/cozy-react-native/pull/295))
* Enforce portrait mode in the app ([PR #292](https://github.com/cozy/cozy-react-native/pull/292) and [PR #294](https://github.com/cozy/cozy-react-native/pull/294))
* Improve Android onboarding by using UniversalLink ([PR #286](https://github.com/cozy/cozy-react-native/pull/286))

## 🐛 Bug Fixes

* Improve status bar handling ([PR #291](https://github.com/cozy/cozy-react-native/pull/291))
* Correctly reset the UI zoom when returning from Cozy Pass ([PR #293](https://github.com/cozy/cozy-react-native/pull/293))
* Fix 2FA scenario to correctly handle cozy-stack's error codes ([PR #284](https://github.com/cozy/cozy-react-native/pull/284))

## 🔧 Tech

* Add new dev setting for enabling/disabling HttpServer proxy ([PR #289](https://github.com/cozy/cozy-react-native/pull/289))
* Add cache control on HttpServer responses ([PR #297](https://github.com/cozy/cozy-react-native/pull/297))

# 0.0.14

## ✨ Features

* Improve wording on Onboarding page ([PR #281](https://github.com/cozy/cozy-react-native/pull/281))
* Improve cozy-apps opening animation ([PR #282](https://github.com/cozy/cozy-react-native/pull/282))

## 🐛 Bug Fixes

* Fix cozy-flags injection from cozy-stack ([PR #264](https://github.com/cozy/cozy-react-native/pull/264) and [PR #273](https://github.com/cozy/cozy-react-native/pull/273))
* Correctly handle initial screen when opening the app ([PR #261](https://github.com/cozy/cozy-react-native/pull/261))
* Fix URL interception in Sosh Client Side Connector ([PR #263](https://github.com/cozy/cozy-react-native/pull/263))
* Fix WebView visibility in Amazon Client Side Connector ([PR #265](https://github.com/cozy/cozy-react-native/pull/265))
* Fix how safe areas are handled on iOS ([PR #267](https://github.com/cozy/cozy-react-native/pull/267) and [PR #278](https://github.com/cozy/cozy-react-native/pull/278))
* Fix how cookies are handled on cozy-home and other cozy-apps ([PR #268](https://github.com/cozy/cozy-react-native/pull/268) and [PR #277](https://github.com/cozy/cozy-react-native/pull/277))
* Fix how Status Bar is handled on iOS ([PR #271](https://github.com/cozy/cozy-react-native/pull/271))
* Declare permissions to use Camera on iOS ([PR #274](https://github.com/cozy/cozy-react-native/pull/274))
* Fix iOS onboarding by using UniversalLink ([PR #278](https://github.com/cozy/cozy-react-native/pull/278))
* Improve cozy-app's lifecycle events ([PR #280](https://github.com/cozy/cozy-react-native/pull/280))
* Fix Client Side Connectors' close button on iOS ([PR #275](https://github.com/cozy/cozy-react-native/pull/275))
* Prevent video autoplay from iOS WebView on Client Side Connectors execution ([PR #283](https://github.com/cozy/cozy-react-native/pull/283))

## 🔧 Tech

* Remove unnecessary `hideSplashScreen` dependency on `useSession`'s hook ([PR #259](https://github.com/cozy/cozy-react-native/pull/259))
* Stop excluding ARM arch on builds ([PR #267](https://github.com/cozy/cozy-react-native/pull/267))
* Add plugins to ease debugging AsyncStorage from flipper ([PR #270](https://github.com/cozy/cozy-react-native/pull/270))
* Optimize file size for Client Side Connectors' close button ([PR #275](https://github.com/cozy/cozy-react-native/pull/275))

# 0.0.13

## ✨ Features


## 🐛 Bug Fixes

* Allow unsecure HTTP on Android in order to serve local assets ([PR #253](https://github.com/cozy/cozy-react-native/pull/253))

## 🔧 Tech

* Improve Client Side Connectors template ([PR #236](https://github.com/cozy/cozy-react-native/pull/236))
* Implement HttpServer to serve local assets for all cozy-apps ([PR #255](https://github.com/cozy/cozy-react-native/pull/255)
* Improve error handling when downloading local assets ([PR #256](https://github.com/cozy/cozy-react-native/pull/256)

# 0.0.12

## ✨ Features

* Add Sosh in Client Side Connectors ([PR #247](https://github.com/cozy/cozy-react-native/pull/247))
* Add Amazon in Client Side Connectors ([PR #243](https://github.com/cozy/cozy-react-native/pull/243))
* Implement new onboarding screens that allow to onboard from email address ([PR #240](https://github.com/cozy/cozy-react-native/pull/240))
* Skip authorization screen on Login when the app is certified as genuine CozyFlaghip app ([PR #241](https://github.com/cozy/cozy-react-native/pull/241))

## 🐛 Bug Fixes

* Fix credentials saving on Client Side Connectors ([PR #246](https://github.com/cozy/cozy-react-native/pull/246))
* Handle unwanted spaces in Cozy URL on Login screen ([PR #244](https://github.com/cozy/cozy-react-native/pull/244))

## 🔧 Tech

* Implement HttpServer to serve local assets for cozy-home ([PR #170](https://github.com/cozy/cozy-react-native/pull/170) and [PR #250](https://github.com/cozy/cozy-react-native/pull/250))
* Implement update mechanism for local assets ([PR #245](https://github.com/cozy/cozy-react-native/pull/245))
* Improve setFlagshipUI API ([PR #237](https://github.com/cozy/cozy-react-native/pull/237))
* Allow on demand Sentry logging ([PR #233](https://github.com/cozy/cozy-react-native/pull/233))

# 0.0.11

## ✨ Features

## 🐛 Bug Fixes

* Fix display on borderless smartphones ([PR #229](https://github.com/cozy/cozy-react-native/pull/229) and [PR #238](https://github.com/cozy/cozy-react-native/pull/238)
* Improve Offline management ([PR #227](https://github.com/cozy/cozy-react-native/pull/227) and [PR #230](https://github.com/cozy/cozy-react-native/pull/230))

## 🔧 Tech

* Improve Client Side Connectors handling ([PR #225](https://github.com/cozy/cozy-react-native/pull/225), [PR #226](https://github.com/cozy/cozy-react-native/pull/226), [PR #234](https://github.com/cozy/cozy-react-native/pull/234) and [PR #235](https://github.com/cozy/cozy-react-native/pull/235))
* Update appBoostrap after client changes ([PR #228](https://github.com/cozy/cozy-react-native/pull/228))

# 0.0.10

## ✨ Features

* Add a Welcome page ([PR #209](https://github.com/cozy/cozy-react-native/pull/209) and [PR #217](https://github.com/cozy/cozy-react-native/pull/217))

## 🐛 Bug Fixes

* Intercept clicks on mailto:, tel:, maps:, geo:, sms: to prevent error  ([PR #180](https://github.com/cozy/cozy-react-native/pull/180) and [PR #213](https://github.com/cozy/cozy-react-native/pull/213))
* Improve Post-me stability when browsing between cozy-apps ([PR #212](https://github.com/cozy/cozy-react-native/pull/212))
* Display splash screen during loading steps  ([PR #214](https://github.com/cozy/cozy-react-native/pull/214))
* Fix Navbar height calculation ([PR #215](https://github.com/cozy/cozy-react-native/pull/215))
* Prevent GoBack after logout  ([PR #218](https://github.com/cozy/cozy-react-native/pull/218))
* Add a safe area on login, onboarding and error screens ([PR #223](https://github.com/cozy/cozy-react-native/pull/223))
* Redirect to the correct screen when the device retrieves Internet connection ([PR #224](https://github.com/cozy/cozy-react-native/pull/224))

## 🔧 Tech

* Add JSX support in Jest configuration ([PR #210](https://github.com/cozy/cozy-react-native/pull/210))

# 0.0.9

## ✨ Features

* The app now displays an Offline screen when no connection is available ([PR #180](https://github.com/cozy/cozy-react-native/pull/180) and [PR #189](https://github.com/cozy/cozy-react-native/pull/189))
* Intercept redirection/reloading and refresh only WebView ([PR #187](https://github.com/cozy/cozy-react-native/pull/187))
* The app now displays a NotFound screen when the entered Cozy url is not valid ([PR #197](https://github.com/cozy/cozy-react-native/pull/197))

## 🐛 Bug Fixes

* Prevent crash during the animated transition after login ([PR #205](https://github.com/cozy/cozy-react-native/pull/205))

## 🔧 Tech

* Fix Android's Back button listener that would produce a memory leak ([PR #196](https://github.com/cozy/cozy-react-native/pull/196))

# 0.0.8

## ✨ Features

* show/hide InApp Browser on cozy-intent call ([PR #179](https://github.com/cozy/cozy-react-native/pull/179))

## 🐛 Bug Fixes

* Force the instance to be lowercase after validating ClouderyView ([PR #169](https://github.com/cozy/cozy-react-native/pull/169))
* Prevent crash during the animated transition after login ([PR #178](https://github.com/cozy/cozy-react-native/pull/178))
* Disable zoom on weviews ([PR #176](https://github.com/cozy/cozy-react-native/pull/176))
* Set a background color to ClouderyWebview ([PR #176](https://github.com/cozy/cozy-react-native/pull/176))
* Fix possible cases of failed handshake preventing webview apps to communicate with the native code ([PR #168](https://github.com/cozy/cozy-react-native/pull/168))

## 🔧 Tech
* Improve webview env injection ([PR #167](https://github.com/cozy/cozy-react-native/pull/167))
* Expose fetchSessionCode method to cozy-intent

# 0.0.7

## ✨ Features

* Handle back navigation on CozyWebView ([PR #140](https://github.com/cozy/cozy-react-native/pull/140))

## 🐛 Bug Fixes

* Don't reset password on bad password ([PR #157](https://github.com/cozy/cozy-react-native/pull/157))

## 🔧 Tech

* Improve debug logs ([PR #150](https://github.com/cozy/cozy-react-native/pull/150) and [PR #154](https://github.com/cozy/cozy-react-native/pull/154) and [PR #161](https://github.com/cozy/cozy-react-native/pull/161))
* Improve linting ([PR #151](https://github.com/cozy/cozy-react-native/pull/151))
* Add Prettier config ([PR #153](https://github.com/cozy/cozy-react-native/pull/153))
* Improve tests tooling ([PR #155](https://github.com/cozy/cozy-react-native/pull/155))
* Improve tests coverage ([PR #156](https://github.com/cozy/cozy-react-native/pull/156))
* Run Test coverage only on CI ([PR #159](https://github.com/cozy/cozy-react-native/pull/159))
* Clear automatically all mocks after each tests ([PR #160](https://github.com/cozy/cozy-react-native/pull/160))
* Add Sentry tracking ([PR #51](https://github.com/cozy/cozy-react-native/pull/51) and [PR #163](https://github.com/cozy/cozy-react-native/pull/163) and [PR #164](https://github.com/cozy/cozy-react-native/pull/164))

# 0.0.1 to 0.0.6

## ✨ Features


## 🐛 Bug Fixes


## 🔧 Tech

* Add dependabot configuration
* Move android Main files inside correct path for react-native link usage
* Remove unused library @react-native-community/masked-view
