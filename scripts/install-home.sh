#!/bin/bash

set -eu

# Define cozy-home developer local
COZY_HOME_WEBAPP_PATH='/Users/recontact/projects/cozy/cozy-home/build'

# 1. Android

# Create Android home build folder:
mkdir -p ./android/app/src/main/assets/cozy-home

# Copy each build file inside the Android home folder
cp -r $COZY_HOME_WEBAPP_PATH  ./android/app/src/main/assets/cozy-home

# 2. iOS

# Create iOS home build folder:
mkdir -p ./iOS/assets/resources/cozy-home

# Copy each build file inside the iOS home folder
cp -r $COZY_HOME_WEBAPP_PATH  ./iOS/assets/resources/cozy-home


echo Done.
echo Result : cozy-home installed inside Amirale assets

