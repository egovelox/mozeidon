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
		"--ansi",
		"--border-label=SWITCH TAB",
		"--header-lines=1",
		"--exact",
		"--no-sort",
		"--scheme=history",
		"--query",
		query,
		// fzf use of {+1} : '+' is for one line space-separated, '1' for field 1 i.e tabs.id
		"--bind=enter:accept-non-empty+become(echo ::switch::{+1})",
	}
	res, err := ChooseTab(&tabs, a.ui, fzfFlags)

	_, id, foundSwitch := strings.Cut(res, "::switch::")

	// user may not choose anything, exit !
	if !foundSwitch {
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
