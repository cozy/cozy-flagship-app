# How to debug cozy-bar in local

Several steps are mandatory to be able to debug cozy-bar used by an app (Drive in our example).


## First start cozy-bar

Be sure to be on the same version than defined in the package.json of the app.

```
cd cozy-bar
git checkout v7-release # Be aware of using the correct version of cozy-bar
yarn
vim your-file-with-change.js
yarn start
```

## Start cozy-drive, consuming cozy-bar and in watch mode as locally hosted webview

```
cd cozy-drive
git checkout master
yarn
rlink cozy-bar
```

And then start the app in --watch mode as a [locally hosted webviews](https://github.com/cozy/cozy-react-native#working-with-locally-hosted-webviews)

## Check on local stack of Flagship App

The Flagship App should be displaying Cozy Drive using the cozy-bar of development.

### Troubleshooting

First, edit in `config/dev.js` the line: `disabledGetIndex: true` to be sure that http server will not cache anything.
Check the version displayed in the log "AppBundle debug Current local version is 'undefined', stack version is '1.43.0'"


### How does it work?

Refer to [existing docs inside Cozy-bar](https://github.com/cozy/cozy-bar#development-mode)
