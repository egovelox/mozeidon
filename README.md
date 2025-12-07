# 🔱 Mozeidon 

TLDR;
- Handle your tabs, bookmarks and history from outside of your web-browser.
- [🆕 Quick install of the mozeidon-macos-ui brew cask](https://github.com/egovelox/mozeidon-macos-ui?tab=readme-ov-file#homebrew)
- [🤓 Install of the mozeidon cli](https://github.com/egovelox/mozeidon?tab=readme-ov-file#installation)

## Intro
Mozeidon is essentially a CLI written in [Go](https://go.dev/) to handle [Mozilla Firefox](https://www.mozilla.org/firefox/) OR [Google Chrome](https://www.google.com/chrome) tabs, history, and bookmarks. 

Here you'll find :
- a guide to complete the [installation](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#installation) of the mozeidon components (see [architecture](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#architecture)).
- [advanced examples](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#examples) of the CLI usage (including integration with `fzf` and `fzf-tmux`) 
- [a Raycast extension](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#raycast-extension) built around Mozeidon CLI (for MacOS only)
- [a MacOS native app](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#macos-swift-app-agent) built around Mozeidon CLI (for MacOS only)

All the code is available here as open-source. You can be sure that :
- your browsing data (tabs, bookmarks, etc) will remain private and safe: mozeidon will never share anything outside of your system.
- at any time, stopping or removing the mozeidon firefox (or chrome) addon extension will stop or remove all related processes on your machine.

Using the ``mozeidon`` CLI, you can : 
- list all currently opened tabs
- list recently-closed tabs
- list current history
- list current bookmarks
- switch to a currently opened tab
- open a new tab (empty tab or with target url)
- close a currently opened tab
- create, delete, update a bookmark

<img width="1512" alt="mozeidon-cli" src="https://github.com/egovelox/mozeidon/assets/56078155/2cfd04c2-d066-49fa-973e-c389e90b1f37">
<br/><br/>

<img width="1512" alt="mozeidon-cli-2" src="https://github.com/egovelox/mozeidon/assets/56078155/9ba5c99b-0436-433c-9b73-427f2b3c897f">
<br/><br/>


## Architecture


<img width="788" alt="mozeidon-architecture" src="https://github.com/egovelox/mozeidon/assets/56078155/15192276-e85f-4de0-956d-6eba0517303b">
<br/><br/>

Mozeidon is built on ipc and native-messaging protocols, using the following components :

- the [Mozeidon firefox or chrome add-on](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-firefox-addon), a JS script running in the Mozilla (or Chrome) browser, receives commands and sends back data (i.e tabs, bookmarks, etc) by leveraging various browser APIs.

- the [Mozeidon native-app](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-native-app), a Go program, interacts with the Mozeidon firefox-addon. It sends commands to, and receive data from the browser addon - via [native-messaging](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Native_messaging) protocol.

- the [Mozeidon CLI](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-cli), another Go program, interacts with the Mozeidon native-app. It sends commands to and receive data from the native-app - via ipc protocol.


## Installation 

You need to install at least 3 components :
- the [Mozeidon firefox add-on](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-firefox-addon) or the [Mozeidon chrome add-on](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-chrome-addon)
- the [Mozeidon native-app](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-native-app)
- the [Mozeidon CLI](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-cli)

## Mozeidon firefox-addon

The mozeidon addon for Mozilla Firefox can be found here :

[https://addons.mozilla.org/en-US/firefox/addon/mozeidon](https://addons.mozilla.org/en-US/firefox/addon/mozeidon)

## Mozeidon chrome-addon

The mozeidon addon for Google Chrome can be found here :

[https://chromewebstore.google.com/detail/mozeidon/lipjcjopdojfmfjmnponpjkkccbjoipe](https://chromewebstore.google.com/detail/mozeidon/lipjcjopdojfmfjmnponpjkkccbjoipe)

## Mozeidon native-app

The [mozeidon native-app](https://github.com/egovelox/mozeidon-native-app), a very simple ipc server written in ``go``, will allow the mozeidon add-on to receive commands from and send responses to the mozeidon CLI ([see below](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-cli)).

On MacOS or Linux, you can install it using ``homebrew`` :
```bash
brew tap egovelox/homebrew-mozeidon ;

brew install egovelox/mozeidon/mozeidon-native-app ;
```

Otherwise, you may download the binary from the [release page](https://github.com/egovelox/mozeidon-native-app/releases).

If no release matches your platform, you can build the binary yourself:
```bash
git clone https://github.com/egovelox/mozeidon-native-app.git ;

cd mozeidon-native-app && go build
```
<br/>
As a firefox native-app, it has to be referenced into your Firefox or Chrome configuration.

### Referencing the native-app into your Firefox configuration

On ``MacOS``, first locate the ``~/Library/Application Support/Mozilla/NativeMessagingHosts`` directory (or create it if missing).

Then create a ``mozeidon.json`` file, and copy into it the following ``json``.

Note: depending on your installation, you may need to replace the value in ``"path"`` with the absolute path of the mozeidon-native-app.

```json
{
  "name": "mozeidon",
  "description": "Native messaging add-on to interact with your browser",
  "path": "/opt/homebrew/bin/mozeidon-native-app",
  "type": "stdio",
  "allowed_extensions": [
    "mozeidon-addon@egovelox.com"
  ]
}
```

Now the Mozeidon firefox-addon will be able to interact with the Mozeidon native-app.

Note : 
For other OS than ``MacOS``, please check the [Mozilla documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#manifest_location) to find the correct location of the Firefox ``NativeMessagingHosts`` directory.

As a last step, you need to install the [Mozeidon CLI](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-cli).

### Referencing the native-app into your Chrome configuration

On ``MacOS``, first locate the ``~/Library/Application Support/Google/Chrome/NativeMessagingHosts`` directory (or create it if missing).

Then create a ``mozeidon.json`` file, and copy into it the following ``json``.

Note: depending on your installation, you may need to replace the value in ``"path"`` with the absolute path of the mozeidon-native-app.

```json
{
  "name": "mozeidon",
  "description": "Native messaging add-on to interact with your browser",
  "path": "/opt/homebrew/bin/mozeidon-native-app",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://lipjcjopdojfmfjmnponpjkkccbjoipe/"]
}
```

Now the Mozeidon chrome-addon will be able to interact with the Mozeidon native-app.

Note : 
For other OS than ``MacOS``, please check the [Chrome documentation](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging#native-messaging-host-location) to find the correct location of the Chrome ``NativeMessagingHosts`` directory.

As a last step, you need to install the [Mozeidon CLI](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-cli).

## Mozeidon CLI

The Mozeidon CLI is a lightweight CLI written in ``go``. 

On MacOS or Linux, you can install it using ``homebrew`` :
```bash
brew tap egovelox/homebrew-mozeidon ;

brew install egovelox/mozeidon/mozeidon ;
```

Otherwise, you may download the binary from the [release page](https://github.com/egovelox/mozeidon/releases).

If no release matches your platform, you can build the binary yourself:
```bash
git clone https://github.com/egovelox/mozeidon.git ;

cd mozeidon/cli && go build
```

## Examples 

### How to use the Mozeidon CLI with ``go-template`` syntax for customized output :

```bash
# get maximum 10 of latest bookmarks, title and url

mozeidon bookmarks -m 10 --go-template '{{range .Items}}{{.Title}} {{.Url}}{{"\n"}}{{end}}'
```

```bash
# get opened tabs, with 📌 icon if pinned

mozeidon tabs get --go-template '{{range .Items}}{{.WindowId}}:{{.Id}} {{.Url}} {{if .Pinned}}📌{{else}}🦊{{end}} {{"\\u001b[38;5;109m"}} {{.Domain}}{{"\\033[0m"}} {{.Title}}{{"\n"}}{{end}}'
```

### Customized tabs output with a pipe into ``fzf``

If you've installed [fzf](https://github.com/junegunn/fzf) you can use it as a kind of UI for mozeidon CLI.

The below `bash` command shows how `fzf` can be used to select a tab, and to open it in your browser.

```bash
mozeidon tabs get --go-template '{{range .Items}}{{.WindowId}}:{{.Id}} {{.Url}} {{if .Pinned}}📌{{else}}🦊{{end}} {{"\u001b[38;5;109m"}} {{.Domain}}{{"\033[0m"}} {{.Title}}{{"\n"}}{{end}}' \
| fzf --ansi --with-nth 3.. --bind=enter:accept-non-empty \
| cut -d ' ' -f1 \
| xargs -n1 -I % sh -c 'mozeidon tabs switch % && open -a firefox'
```

note : ``xargs -n1`` prevents to run any command if no tab was chosen with fzf ( say, for example, that you exited fzf with ctrl-c )

note : ``mozeidon tabs switch`` is used to switch to the tab you chose in fzf

### Same as previous, but tailored for tmux

As an example, let's bind our mozeidon script with the tmux shortcut ``Prefix-t``

```bash
# in $HOME/.tmux.conf
bind t run-shell -b "bash $HOME/.tmux/mozeidon_tabs.sh"
```

Now create the script ``$HOME/.tmux/mozeidon_tabs.sh`` :

```bash
#!/bin/bash
mozeidon tabs get --go-template \
'{{range .Items}}{{.WindowId}}:{{.Id}} {{.Url}} {{if .Pinned}}📌{{else}}🦊{{end}} {{"\u001b[38;5;109m"}} {{.Domain}}{{"\033[0m"}}  {{.Title}}{{"\n"}}{{end}}' \
| fzf-tmux -p 60% -- \
--no-bold --layout=reverse --margin 0% --no-separator --no-info --black --color bg+:black,hl:reverse,hl+:reverse,gutter:black --ansi --with-nth 3.. --bind=enter:accept-non-empty \
| cut -d ' ' -f1 \
| xargs -n1 -I % sh -c '$HOME/bin/mozeidon tabs switch % && open -a firefox'
```

### Another advanced fzf-tmux script

This more advanced script will allow to :
- open a new tab (empty or with search query)
- switch to a currently open tab
- close one or many tabs

```bash
#!/bin/bash
$HOME/bin/mozeidon tabs get --go-template \
  '{{range .Items}}{{.WindowId}}:{{.Id}} {{.Url}} {{if .Pinned}}📌{{else}}🦊{{end}} {{"\u001b[38;5;109m"}}  {{.Domain}}{{"\033[0m"}}  {{.Title}}{{"\n"}}{{end}}'\
  | fzf-tmux -p 60% -- \
  --border-label=TABS \
  --no-bold \
  --layout=reverse \
  --margin 0% \
  --no-separator \
  --no-info \
  --black \
  --color bg+:black,hl:reverse,hl+:reverse,gutter:black \
  --with-nth 3.. \
  --bind="enter:accept+execute($HOME/bin/mozeidon tabs switch {1} && open -a firefox)" \
  --multi \
  --marker=❌ \
  --bind="ctrl-p:accept-non-empty+execute($HOME/bin/mozeidon tabs close {+1})" \
  --bind="ctrl-o:print-query" \
  --header-first \
  --color=header:#5e6b6b \
  '--header=close tab(s) [C-p] 
open new tab [C-o]'\
  | grep -v "[🦊📌]" \
  | xargs -r -I {} sh -c '$HOME/bin/mozeidon tabs new "{}" && open -a firefox'
```

## Raycast extension

For MacOS and Firefox users only : see [the Mozeidon Raycast extension](https://www.raycast.com/egovelox/mozeidon).

This Raycast extension will not work with Chrome browser. If you use MacOS, see [MacOS swift app-agent](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#macos-swift-app-agent)

Note that you'll first need to complete the installation of Mozeidon components ([Mozeidon firefox add-on](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-firefox-addon), [Mozeidon native-app](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-native-app) and [Mozeidon CLI](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-cli)).

Note that you cannot list **history items** with this Raycast extension : only **tabs**, **recently-closed tabs**, and **bookmarks**.

![mozeidon-4](https://github.com/egovelox/mozeidon/assets/56078155/a3b8d378-7fe2-4062-9722-15b4cf7f9d6f)


## MacOS swift app-agent

If you ask for something faster than [Raycast](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#raycast-extension) ( which I find quite slow to trigger the search list ),  
you might take a look at this macOS app [mozeidon-macos-ui](https://github.com/egovelox/mozeidon-macos-ui)

<img width="640" alt="mozeidon-macos-ui" src="https://github.com/user-attachments/assets/8590a296-3a4d-4287-b362-83804893710e" />


## Releases

Various releases of the Mozeidon CLI can be found on the [releases page](https://github.com/egovelox/mozeidon/releases).

Releases are managed with github-actions and [goreleaser](https://github.com/goreleaser/goreleaser).

A release will be auto-published when a new git tag is pushed,
e.g :

```bash
git clone https://github.com/egovelox/mozeidon.git && cd mozeidon;

git tag -a v2.0.0 -m "A new mozeidon (CLI) release"

git push origin v2.0.0
```

## Local development setup

We'll assume that you installed and followed the steps described in the `Mozeidon native-app` paragraph above.
In fact, you rarely need to modify this component, it's just a message broker (see the `architecture` paragraph above ).

First clone this repository.

Then, build the cli and the extensions locally :

```bash
make all
```
Now, before loading the local extension in your browser, don't forget to disable any running instance of the `mozeidon` extension. 

Then, in Firefox ( or any web-browser ), via `Extensions > Debug Addons > Load Temporary Add-on`, select the manifest file in `firefox-addon/manifest.json`.  
This will load the local extension.

From there, you may want to go further and build the CLI also :

You should now be able to execute the CLI using the local binary :

```bash
./cli/mozeidon tabs get
```

## Notes and well-known limitations

#### `mozeidon` cannot work simultaneously in different web-browsers

For users who installed both the firefox-addon AND the chrome-addon, or for those who use multiple browsers, each loading the mozeidon extension :

`mozeidon` CLI will not work properly when multiple instances of the mozeidon browser-extension are activated at the same time.  
To overcome this limitation, keep one extension activated (e.g firefox-addon)  
and deactivate the other extension (e.g chrome-addon).

If you notice any error during this operation, try to deactivate/reactivate the browser extension 🙏.

This is currently not planned for resolution. Technically, to overcome this limitation, we would need a particular native-messaging-host (`mozeidon-native-app`) 
for each web-browser.  
The installation would surely be too complex for most users. 
(see [architecture](https://github.com/egovelox/mozeidon?tab=readme-ov-file#architecture)),  

#### For a given web-browser, `mozeidon` cannot work correctly if you use multiple browser windows.

Mozeidon cannot guess in which browser window a given tab-id is located.  
Consequently, if you have 2 browser windows,  
`mozeidon tabs switch [tab-id]` will switch to the last active browser window,  
where, possibly, the tab-id you targeted is not located.

This is by design, `mozeidon` was precisely meant to facilitate browsing within a unique browser window.

See [https://github.com/egovelox/mozeidon/issues/6](https://github.com/egovelox/mozeidon/issues/6)

#### `mozeidon bookmark update --folder-path` and browsers' *default bookmark folder*.

##### TLDR

By design, the `mozeidon` cli can only `move` bookmarks ( e.g changing their folder location ) to places located under the *Bookmarks Bar* tree. 

For `mozeidon` cli, there is no valid `--folder-path` for places located outside of the *Bookmarks Bar* tree.

The cli still allows `get`, `update`, `delete` operations for those bookmarks located outside of the *Bookmarks Bar* tree, but as for `moving` them, it can only `move` them inside the *Bookmarks Bar* tree. 

This is by design : the cli uses a `folder-path` model, with the root, represented as `/`, being actually the *Bookmarks Bar* itself.

##### Details

Each browser has a *default bookmark folder*, e.g `Other Bookmarks` in Firefox, `Other Favorites` in Edge, etc.  
But internally, in the browser, this *default bookmark folder* IS NOT LOCATED INSIDE THE *Bookmarks Bar* tree ( though this folder may be displayed by the browser in the *Bookmarks Bar* ).

This *default bookmark folder* contravenes `mozeidon` design for bookmarks folder locations (`--folder-path`):  
In `mozeidon`, a `--folder-path` value:
- is always a path starting from the root of the *Bookmarks Bar* tree ( aka *Favorites Bar* ) represented as `/`
- should always start with `/`
- should always end with `/`


E.g in `mozeidon` :
- `--folderPath "//surf/"` represents a `surf` folder, inside a `""` (no title) folder, inside the *Bookmarks Bar*
- `--folderPath "//Other Bookmarks/"` represents a `Other Bookmarks` folder, inside a `""` (no title) folder, inside the *Bookmarks Bar*
  ( and it should not be confused with Firefox's *default bookmark folder* )

Because internally, inside the browser, this *default bookmark folder* is not located in the *Bookmarks Bar* tree - though this folder may be displayed by the browser in the *Bookmarks Bar*, the `--folder-path` flag on the `mozeidon bookmark` commands cannot reference such *default bookmark folder*,
meaning that :
- You can create a bookmark in the *default bookmark folder* with `mozeidon bookmark new` by omitting the `--folder-path` flag.
- Such created bookmark will appear in the results of `mozeidon bookmarks` with a `parent` field of `"parent":"//Other Bookmarks/"`
- You cannot move such bookmark in a *child* folder ( i.e inside the *default bookmark folder* ) with e.g (let's say our bookmark-id is `42`) `mozeidon bookmark update 42 --folder-path '//Other Bookmarks/surf/'`
- Instead, that command will move the bookmark in a `surf` folder, inside a `Other Bookmarks` folder, inside a `""` (no title) folder, inside the *Bookmarks Bar*
- But still, you can move such bookmark in a folder located inside the *Bookmarks Bar*, with e.g `mozeidon bookmark update 42 --folder-path '/surf/'`
