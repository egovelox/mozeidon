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


# TODOS
- think again of `inMemoryBookmarkMap` in `firefox-addon/src/services/bookmarks.ts`
- change doc on `cli/cmd/bookmark/update-bookmark.go` so that user can send empty-strings
- add a --excludeFolderPath flag to exclude bookmarks coming from given parents ?

# ADD TO README
- for 'browser-managed bookmark-folder'
like 'Other Bookmarks' on firefox,
or 'Other Favorites' or 'MY_COMPANY Managed Favorites' on Edge
    - a bookmark coming from such folder will appear on GET under a parent like : '//OtherBookmarks/'
    - you can add a bookmark in suche folder by simply omitting the -f --folder-path param in the cli
    (ofc only if the folder is writable, which is not always the case for company-managed folders )
    This is a behaviour allowed by the browser, that the cli replicates.

- a new rule in the cli, as a consequence :
you will never be able to add a flag -f '' : it has to start with a '/'
- '/' meaning create the bookmark in the Favorite Bar
- '//' meaning create the bookmark in a folder named '' in the Favorite Bar
  if the folder exists, the bookmark will be added in that existing folder.
how to create a folder in the OtherBookmarks ?
We will use a value like : /_Browser_Default_Location/


