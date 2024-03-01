package core

import (
	"log"
	"os"
	"strings"

	"github.com/egovelox/mozicli/browser/core/models"
)

func (a *App) TabsClose(query string) {
	// TODO: handle error
	tabs, _ := a.TabsGet()

	fzfFlags := []string{
		// Case-insensitive
		"-i",
		"--ansi",
		"--border-label=CLOSE TAB",
		"--exact",
		"--no-sort",
		"--scheme=history",
		"--multi",
		"--marker=❌",
		"--query",
		query,
		// fzf use of {+1} : '+' is for one line space-separated, '1' for field 1 i.e tabs.id
		"--bind=enter:accept-non-empty+become(echo ::close::{+1})",
	}
	res, _ := ChooseTab(&tabs, a.ui, fzfFlags)

	_, ids, foundClose := strings.Cut(res, "::close::")

	if !foundClose {
		return
	}

	_, err := a.browser.Send(
		models.Command{
			Command: "close-tabs",
			Args:    strings.Join(strings.Split(ids, " "), ","),
		},
	)
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
}
