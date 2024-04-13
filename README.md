# Mozeidon 

Mozeidon is essentially a CLI written in [Go](https://go.dev/) to handle [Mozilla Firefox](https://www.mozilla.org/firefox/) tabs and bookmarks. 

Here you'll find :
- a guide to complete the installation of the mozeidon components (see [architecture](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#architecture)).
  - install the [Mozeidon firefox add-on](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-firefox-addon)
  - install the [Mozeidon native-app](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-native-app)
  - install the [Mozeidon CLI](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-cli)
- [advanced examples](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#examples) of the CLI usage (including integration with fzf and fzf-tmux) 
- [a Raycast extension](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#raycast-extension) built around Mozeidon (for MacOS only)

All the code is available here as open-source. You can be sure that :
- your browsing data (tabs, bookmarks, etc) will remain private and safe: mozeidon will never share anything outside of your system.
- at any time, stopping or removing the ``mozeidon firefox addon extension`` will stop or remove all related processes on your machine.

Using the ``mozeidon`` CLI, you can : 
- list all currently opened tabs
- list recently-closed tabs
- list current bookmarks
- switch to a currently opened tab
- open a new tab (empty tab or with target url)
- close a currently opened tab

<img width="1512" alt="mozeidon-cli" src="https://github.com/egovelox/mozeidon/assets/56078155/2cfd04c2-d066-49fa-973e-c389e90b1f37">
<br/><br/>

<img width="1512" alt="mozeidon-cli-2" src="https://github.com/egovelox/mozeidon/assets/56078155/9ba5c99b-0436-433c-9b73-427f2b3c897f">
<br/><br/>


## Architecture


<img width="788" alt="mozeidon-architecture" src="https://github.com/egovelox/mozeidon/assets/56078155/15192276-e85f-4de0-956d-6eba0517303b">
<br/><br/>

Mozeidon is built on ipc and native-messaging protocols, using the following components :

- the [Mozeidon firefox add-on](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-firefox-addon), a JS script running in the Mozilla browser, receives commands and sends back data (i.e tabs, bookmarks, etc) by leveraging various browser APIs.

- the [Mozeidon native-app](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-native-app), a Go program, interacts with the Mozeidon firefox-addon. It sends commands to, and receive data from the browser addon - via native-messaging protocol.

- the [Mozeidon CLI](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-cli), another Go program, interacts with the Mozeidon native-app. It sends commands to and receive data from the native-app - via ipc protocol.


Of course you need to install each of these components :
- the [Mozeidon firefox add-on](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-firefox-addon)
- the [Mozeidon native-app](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-native-app)
- the [Mozeidon CLI](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-cli)

## Mozeidon firefox-addon

The mozeidon addon for Mozilla Firefox can be found here :

[https://addons.mozilla.org/en-US/firefox/addon/mozeidon](https://addons.mozilla.org/en-US/firefox/addon/mozeidon)

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
As a firefox native-app, it has to be referenced into your Firefox configuration.

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

As a last step, you need to install the Mozeidon CLI.

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

For MacOS users only : see [the Mozeidon Raycast extension](https://www.raycast.com/egovelox/mozeidon).

Note that you'll first need to complete the installation of Mozeidon components ([Mozeidon firefox add-on](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-firefox-addon), [Mozeidon native-app](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-native-app) and [Mozeidon CLI](https://github.com/egovelox/mozeidon/tree/main?tab=readme-ov-file#mozeidon-cli)).

![mozeidon-4](https://github.com/egovelox/mozeidon/assets/56078155/a3b8d378-7fe2-4062-9722-15b4cf7f9d6f)

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




