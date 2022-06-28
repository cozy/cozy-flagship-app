# 0.0.16

## ✨ Features


## 🐛 Bug Fixes

* Status bar stop disappearing when focus on konnector input text
* Wait 1 ms to display ClouderyView Overlay to prevent flash white screen


## 🔧 Tech


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
