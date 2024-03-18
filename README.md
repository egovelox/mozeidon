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
mozeidon tabs --template '{{range .Items}}{{.WindowId}}:{{.Id}} {{.Url}} {{if .Pinned}}📌{{else}}🦊{{end}} {{"\\u001b[38;5;109m"}} {{.Domain}}{{"\\033[0m"}} {{.Title}}{{"\n"}}{{end}}' | fzf --ansi --with-nth 3..
```
