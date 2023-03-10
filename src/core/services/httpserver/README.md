# HTTP Server

## Nomenclature

- `HTTP Server`: in this document `HTTP Server` refers to a local HTTP server hosted on the devices. HTTP servers hosted outside of the device (i.e. internet) should be referenced with another name (i.e. `cozy-stack`, `cloudery`)
- `asset server`: a server used to serve assets (i.e. `html`, `js` or `css` files)
- `proxy server`: a server used as a gateway between the device and the internet 
- `cozy-stack`: refers to the Cozy's server
- `cozy-app`: refers to an application running on a Cozy instance (i.e. `cozy-home`, `cozy-drive` etc)
- `cozy-app build`: refers to the binary files used to execute the `cozy-app`
- `app registry`: refers to the Cozy regristry containing information about all available `cozy-app` and their installation packages

## Introduction

The goal of the `HTTP Server` is to store `cozy-apps` assets into the phone's local storage and to serve them through the HTTP protocol. This will allow to start `cozy-apps` faster as their code and assets are stored locally and so we reduce the latency induced by an internet access.

As the ReactNative app heavily relies on webviews for displaying apps, using a local `HTTP Server` is a good solution to fasten `cozy-apps` loading.

Before choosing that solution, we previously investigated some other solutions. For example we tried to implement the Service Worker API, but the support for this API is not complete on all target devices (i.e. iOS) and so we decided to not use that technology.

Using a `HTTP Server` allow us to answer all requirements with only a few cons. We will use it as an `asset server` to deliver all required `html`, `js`, `css` files and static images.
Also this opens the path for a potential usage as a `proxy server` in the future in order to cache queries from `cozy-stack`. However the current implementation only focus on the `asset server` aspect and we have some other technologies that are candidates for this problematic.

## Requirements

### Fast app loading

The primary goal of the `HTTP Server` is to allow fast app loading. We want to ensure that the user won't wait too much when opening the app before they can interact with it.

This is why the `HTTP Server` is configured as a local `asset server`. It will ensure that all needed assets already exist locally so `cozy-apps` won't need to retrieve them from internet.

The server architecture should allow the app to pre-load `cozy-apps builds` from the `cozy-stack` and to uses them when needed. We expect to load those `cozy-apps builds` on the first access. So the first `cozy-app` opening may be as long as if served from a classic internet access, but all following opening will be faster. 

We have a specific case for `cozy-home` that is the first `cozy-app` displayed when opening the app. With that aspect in mind, we want to embed a `cozy-home build` directly in the app binary, so no pre-load would be necessary.

### Update mechanism

The `HTTP Server` should be able to update `cozy-apps` when a new version is available. Ideally the app should be able to display the exact same version as if it was loaded from a web browser.

To make this we can rely on the `cozy-stack` API which would allow us to retrieve the expected `cozy-app` version and then to download it from the `app registry`.

In order to keep priority on having a fast loading app, we choose to always display the local `cozy-app` version to the user, and then to download the update in background. So the update will only be available on the next app opening.

### Cozy-stack params injection

One of the cons of using a local `asset server` is that we don't benefit anymore of the `cozy-stack` parameter injection.

When loaded from a web browser, the app's `index.html` is always edited by the `cozy-stack` in order to inject data needed for the app's execution. For example, injected data contains the session's token, the user's `cozy-flags` or the cozy instance's configuration (i.e. domain type, fqdn, etc.).

Without those data, the `cozy-app` won't be able to run correctly.

So the `HTTP Server` has to retrieve those data from the `cozy-stack` and inject them into the `index.html`. 

### Apps isolation

### Do not rely on 3rd pary cookies

### 