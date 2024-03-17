package core

import (
	"fmt"
	"os/exec"
	"strings"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) Tabs(query string, recentlyClosed bool) {
	// TODO: handle error
	tabsConfig := a.viper.GetStringMapString("tabs")

	fzfFlags := []string{
		// Case-insensitive
		"-i",
		"--cycle",
		"--color=header:108",
		"--ansi",
		"--border-label=TABS",
		//"--exact",
		"--no-sort",
		"--scheme=history",
		"--query",
		query,
		"--multi",
		"--marker=❌",
		// fzf use of {+1} : '+' is for one line space-separated, '1' for field 1 i.e tabs.id
		"--bind=enter:accept-non-empty+become(echo ::switch::{+1})",
		fmt.Sprintf(
			"--bind=%s:accept-non-empty+become(echo ::close::{+1})",
			tabsConfig["fzf_close_key"],
		),
		fmt.Sprintf("--bind=%s:print-query", tabsConfig["fzf_open_key"]),
		fmt.Sprintf(
			"--header=close tab(s) [%s]\nopen new tab [%s]",
			tabsConfig["fzf_close_key"],
			tabsConfig["fzf_open_key"],
		),
		// omit windowId and tabId cf tabs-ui.go
		"--header-first",
		"--color=header:#5e6b6b",
		"--with-nth=2..",
	}
	res, err := a.ChooseTab(a.TabsGet(recentlyClosed), fzfFlags)

	if err != nil {
		// TODO: find a way to log a useful error
		// (not logging the error coming from fzf Ctrl-c)
		// os.Exit(1)
		return
	}
	_, id1, foundSwitch := strings.Cut(res, "::switch::")
	_, id2, foundClose := strings.Cut(res, "::close::")

	if !foundSwitch && !foundClose {
		if len(res) > 0 {
			<-a.browser.Send(
				models.Command{
					Command: "new-tab",
					Args:    res,
				},
			)
			cmd := exec.Command("open", "-a", "firefox")
			cmd.Run()
		} else {
			// user may not choose anything, exit !
			return
		}
	}

	if foundSwitch {
		<-a.browser.Send(
			models.Command{
				Command: "switch-tab",
				Args:    id1,
			},
		)
		cmd := exec.Command("open", "-a", "firefox")
		cmd.Run()
	}
	if foundClose {
		<-a.browser.Send(
			models.Command{
				Command: "close-tabs",
				Args:    strings.Join(strings.Split(id2, " "), ","),
			},
		)
	}
}
