# How to install cozy-home in local assets

On first launch, the application should be able to display the cozy-home app as fast as possible

To do so, we chose to embed a copy of cozy-home's build in the app's assets

This implies that the application cannot be build without those assets. So they must be copied in Android and iOS directories first

To ease this process, a script `./install-home.sh` is available

## How to run this script

This script is based on the `$COZY_HOME_WEBAPP_BUILD_PATH` ENV variable. You should define it with the path to cozy-home's build directory

The easiest way to do this is to edit you `.zshrc` file (or equivalent if you use any other bash) and to add this line:
```bash
export COZY_HOME_WEBAPP_BUILD_PATH="/Users/<path_to_your_project_dir>/cozy-home/build"
```

Restart your bash environment to apply the change

Then you can copy cozy-home's build directory to respective platforms assets' directory by executing:
```bash
yarn install:home
```

## When to execute this script

Execute this script if:
- This is the first time you build the project
- Some updates have been done on cozy-home and you want to test them in the app
- A release is being done (don't forget to build the correct branch from cozy-home first)

Note that the install is applied only after an Android or iOS build (`yarn android` or XCode build)
