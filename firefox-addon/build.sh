#!/usr/bin/env bash
#
set -ex

npm install && npm run prettier && npm run build

# Copy source map for webextension-polyfill to suppress Firefox warning
cp node_modules/webextension-polyfill/dist/browser-polyfill.js.map dist/ 2>/dev/null || true
