# Mozeidon 

Mozeidon is essentialy a CLI bringing back home Mozilla Firefox tabs and bookmarks. 

All the code is open-source, you may review it easily and be sure that : 
- your browser data (tabs, bookmarks) will always stay safe, it will never be used outside of your system, for any other purpose than offering a CLI around Mozilla Firefox.
- at any time, stopping or removing the ``mozeidon addon extension`` will stop or remove all related processes on your machine.

Here you'll find :
- a guide to complete installation of the mozeidon native-app and mozeidon CLI.
- examples of the CLI usage (including fzf and fzf-tmux) 
- a Raycast extension built around Mozeidon (for MacOS only)

## Architecture

Mozeidon is built on ipc and native-messaging protocols, using the following components :

- the Mozeidon addon, a JS script running in the Mozilla browser, receives commands and sends back data (i.e tabs, bookmarks, etc) by leveraging various browser APIs.

- the Mozeidon native-app, a Go program, interacts with the Mozeidon addon. It sends commands to, and receive data from the browser addon - via native-messaging protocol.

- the Mozeidon CLI, another Go program, interacts with the Mozeidon native-app. It sends commands to and receive data from the native-app - via ipc protocol.


Of course you need to install each of these components :
- the Mozeidon addon
- the Mozeidon native-app
- the Mozeidon CLI

## Mozeidon addon

The mozeidon addon for Mozilla Firefox can be found here :

[https://addons.mozilla.org/en-US/firefox/addon/mozeidon](https://addons.mozilla.org/en-US/firefox/addon/mozeidon)

## Mozeidon native-app

The mozeidon native-app, a very simple ipc server written in ``go``, will allow the mozeidon add-on to receive commands from and send responses to the mozeidon CLI (see below).

If you're using MacOS M1/M2, you should be able to use directly the available binary in [cli/mozeidon](https://github.com/egovelox/mozeidon/blob/main/native-app/mozeidon-app).

Otherwise, you may need to build the binary yourself for your platform :
```bash
cd native-app && go build
```

As a standard native-app, it has to be referenced it into your Firefox configuration.

### Referencing the native-app into your Firefox configuration

On ``MacOS``, first locate the ``~/Library/Application Support/Mozilla/NativeMessagingHosts`` directory (or create it if missing).

Then create a ``mozeidon.json`` file, and copy into it the following ``json``, replacing ``YOUR_INSTALLATION_PATH`` with the absolute path of the folder where you cloned this git repository.

```json
{
  "name": "mozeidon",
  "description": "Native messaging add-on to interact with your browser",
  "path": "/YOUR_INSTALLATION_PATH/mozeidon/native-app/mozeidon-app",
  "type": "stdio",
  "allowed_extensions": [
    "mozeidon-addon@egovelox.com"
  ]
}
```

Now the mozeidon add-on will be allowed to interact with the mozeidon native-app.

Note : 
For other OS than ``MacOS``, please check the [Mozilla documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#manifest_location) to find the correct location.

Then, you should be able to use the Mozeidon CLI or the Raycast extension.

## Mozeidon CLI

The Mozeidon CLI is written in ``go``. 

If you're using MacOS M1/M2, you should be able to use directly the available binary in [cli/mozeidon](https://github.com/egovelox/mozeidon/blob/main/cli/mozeidon).

Otherwise you need to build the binary yourself for your platform :
```bash
cd cli && go build
```

### How to use the CLI with ``go-template`` syntax for customized output :

```bash
mozeidon tabs --template '{{range .Items}}{{.WindowId}}:{{.Id}} {{.Url}} {{if .Pinned}}📌{{else}}🦊{{end}} {{"\\u001b[38;5;109m"}} {{.Domain}}{{"\\033[0m"}} {{.Title}}{{"\n"}}{{end}}'
```

### Customized tabs output with a pipe into ``fzf``

If you've installed [fzf](https://github.com/junegunn/fzf) you can use it as a kind of UI for mozeidon CLI.

The below `bash` command shows how `fzf` can be used to select a tab, and to open it in your browser.

```bash
mozeidon tabs -t '{{range .Items}}{{.WindowId}}:{{.Id}} {{.Url}} {{if .Pinned}}📌{{else}}🦊{{end}} {{"\u001b[38;5;109m"}} {{.Domain}}{{"\033[0m"}} {{.Title}}{{"\n"}}{{end}}' \
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
mozeidon tabs -t \
'{{range .Items}}{{.WindowId}}:{{.Id}} {{.Url}} {{if .Pinned}}📌{{else}}🦊{{end}} {{"\u001b[38;5;109m"}} {{.Domain}}{{"\033[0m"}}  {{.Title}}{{"\n"}}{{end}}' \
| fzf-tmux -p 60% -- \
--no-bold --layout=reverse --margin 0% --no-separator --no-info --black --color bg+:black,hl:reverse,hl+:reverse,gutter:black --ansi --with-nth 3.. --bind=enter:accept-non-empty \
| cut -d ' ' -f1 \
| xargs -n1 -I % sh -c '$HOME/bin/mozeidon tabs switch % && open -a firefox'
```

### Another advanced fzf-tmux script

This more advanced script will allow to :
- open a new tab (empty or with search query)
- switch to a currently opened tab
- close one or many tabs

```bash
#!/bin/bash
$HOME/bin/mozeidon tabs -t \
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

TODO

