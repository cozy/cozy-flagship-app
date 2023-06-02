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
  