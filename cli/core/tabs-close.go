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
		"--black",
		"--ansi",
		"--color=fg:246,fg+:167,bg+:black",
		"--no-bold",
		"--no-hscroll",
		"--layout=reverse",
		"--bind",
		"change:first",
		"--height",
		"50%",
		"--no-separator",
		"--border=bold",
		"--border-label=CLOSE TAB",
		"--padding",
		"7%",
		"--exact",
		"--no-sort",
		"--scheme=history",
		"--multi",
		"--marker=❌",
		"--query",
		query,
	}
	res, _ := ChooseTab(&tabs, a.ui, fzfFlags)

	chosenTabs := strings.Split(res, "\n")
	tabIds := []string{}

	for _, tab := range chosenTabs {
		id, _, found := strings.Cut(strings.TrimSpace(tab), " ")
		if !found {
			continue
		}
		tabIds = append(tabIds, id)
	}

	// user may not choose any tab, exit !
	if len(tabIds) == 0 {
		return
	}

	_, err := a.browser.Send(
		models.Command{
			Command: "close-tabs",
			Args:    strings.Join(tabIds, ","),
		},
	)
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
}
