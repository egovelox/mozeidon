# Mozeidon addon source-code

The source code is written in ``typescript`` and built with ``webpack``.
As specified in the ``package.json``, the ``node`` version should be >= 20 and the ``npm`` version should be >= 10.

We provide a shell script named ``build.sh`` that will produce the built artifact in ``dist/background.js``

```bash
#!/usr/bin/env bash

set -ex

npm install && npm run build
```

Note :
The source-code was provided in a ``source.zip`` file produced with the command :
```bash
zip -r -FS ./source.zip . --exclude 'icons/' --exclude 'node_modules/*' --exclude '.DS_Store' --exclude 'manifest.json' --exclude 'dist/background.js' --exclude 'mozeidon.zip'
```
