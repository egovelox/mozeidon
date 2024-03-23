# Mozeidon 

Mozeidon is essentialy a CLI bringing back home Mozilla Firefox tabs and bookmarks. 

You'll find here also :
- examples of the CLI usage (including fzf and fzf-tmux) 
- a Raycast extension built around Mozeidon (for MacOS only)

### Architecture

Mozeidon is built on ipc and native-messaging protocols, using the following components :

- the Mozeidon addon, a JS script running in the Mozilla browser, receives commands and sends back data (i.e tabs, bookmarks, etc) by leveraging various browser APIs.

- the Mozeidon native-app, a Go program, interacts with the Mozeidon addon. It sends commands to, and receive data from the browser addon - via native-messaging protocol.

- the Mozeidon CLI, another Go program, interacts with the Mozeidon native-app. It sends commands to and receive data from the native-app - via ipc protocol.


Of course you need to install each of these components :
- the Mozeidon addon
- the Mozeidon native-app
- the Mozeidon CLI

### Mozeidon addon

### Mozeidon-app

### Mozeidon CLI

#### Tips

- How to use the ``go-template`` syntax for customized output :

```bash
mozeidon tabs --template '{{range .Items}}{{.WindowId}}:{{.Id}} {{.Url}} {{if .Pinned}}📌{{else}}🦊{{end}} {{"\\u001b[38;5;109m"}} {{.Domain}}{{"\\033[0m"}} {{.Title}}{{"\n"}}{{end}}'
```

- Customized tabs output with a pipe into ``fzf``: by choosing one, it will open it in your browser :
```bash
mozeidon tabs -t '{{range .Items}}{{.WindowId}}:{{.Id}} {{.Url}} {{if .Pinned}}📌{{else}}🦊{{end}} {{"\u001b[38;5;109m"}} {{.Domain}}{{"\033[0m"}} {{.Title}}{{"\n"}}{{end}}' | fzf --ansi --with-nth 3.. --bind=enter:accept-non-empty | cut -d ' ' -f1 | xargs -n1 -I % sh -c 'mozeidon tabs switch % && open -a firefox'```

note : ``xargs -n1`` prevents to run any command if no tab was chosen with fzf ( say, for example, that you exited fzf with ctrl-c )

note : ``mozeidon tabs switch`` is used to switch to the tab you chose in fzf

- Same as previous, but tailored for tmux (shortcut Prefix-t)

```bash
# in $HOME/.tmux.conf
bind t run-shell -b "bash $HOME/.tmux/mozeidon_tabs.sh"
```
where ``$HOME/.tmux/mozeidon_tabs.sh`` is the following ``bash`` script :
```bash
#!/bin/bash
# in $HOME/.tmux/mozeidon_tabs.sh
mozeidon tabs -t \
'{{range .Items}}{{.WindowId}}:{{.Id}} {{.Url}} {{if .Pinned}}📌{{else}}🦊{{end}} {{"\u001b[38;5;109m"}} {{.Domain}}{{"\033[0m"}}  {{.Title}}{{"\n"}}{{end}}' \
| fzf-tmux -p 60% -- \
--no-bold --layout=reverse --margin 0% --no-separator --no-info --black --color bg+:black,hl:reverse,hl+:reverse,gutter:black --ansi --with-nth 3.. --bind=enter:accept-non-empty \
| cut -d ' ' -f1 \
| xargs -n1 -I % sh -c '$HOME/bin/mozeidon tabs switch % && open -a firefox'
```
