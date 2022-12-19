# 1.0.1

## ✨ Features


## 🐛 Bug Fixes


## 🔧 Tech


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
