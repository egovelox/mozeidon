package core

import (
	"log"
	"os"
	"os/exec"
	"strings"

	"github.com/egovelox/mozicli/browser/core/models"
)

func (a *App) TabsSwitch(query string) {
	// TODO: handle error
	tabs, err := a.TabsGet()

	fzfFlags := []string{
		// Case-insensitive
		"-i",
		"--black",
		"--ansi",
		"--color=fg:246,fg+:150,bg+:black",
		"--no-bold",
		"--no-hscroll",
		"--layout=reverse",
		"--bind",
		"change:first",
		"--height",
		"50%",
		"--no-separator",
		"--border=bold",
		"--border-label=SWITCH TAB",
		"--padding",
		"7%",
		"--header-lines=1",
		"--exact",
		"--no-sort",
		"--scheme=history",
		"--query",
		query,
	}
	res, err := ChooseTab(&tabs, a.ui, fzfFlags)

	id, _, found := strings.Cut(res, " ")
	// user may not choose any tab, exit !
	if !found {
		return
	}

	_, err = a.browser.Send(
		models.Command{
			Command: "switch-tab",
			Args:    id,
		},
	)
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
	cmd := exec.Command("open", "-a", "firefox")
	cmd.Run()
}
