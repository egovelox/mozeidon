#!/usr/bin/env bash
#
set -ex

# Sync source code from firefox-addon
echo "Copying source from firefox-addon..."
rm -rf src/
cp -r ../firefox-addon/src ./src

npm install && npm run build
