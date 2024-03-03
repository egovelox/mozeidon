package core

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"

	"github.com/egovelox/mozicli/browser/core/models"
)

func (a *App) Tabs(query string) {
	// TODO: handle error
	tabs, err := a.TabsGet()
	tabsConfig := a.viper.GetStringMapString("tabs")

	fzfFlags := []string{
		// Case-insensitive
		"-i",
		"--cycle",
		"--ansi",
		"--border-label=TABS",
		"--exact",
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
			tabsConfig["close_key"],
		),
		fmt.Sprintf("--bind=%s:print-query", tabsConfig["open_key"]),
		fmt.Sprintf(
			`--header= close [%s], open [%s]`,
			tabsConfig["close_key"],
			tabsConfig["open_key"],
		),
		"--header-first",
	}
	res, err := ChooseTab(&tabs, a.ui, fzfFlags)

	_, id1, foundSwitch := strings.Cut(res, "::switch::")
	_, id2, foundClose := strings.Cut(res, "::close::")

	if !foundSwitch && !foundClose {
		if len(res) > 0 {
			_, err = a.browser.Send(
				models.Command{
					Command: "open-tab",
					Args:    res,
				},
			)
			if err != nil {
				log.Println(err)
				os.Exit(1)
			}
			cmd := exec.Command("open", "-a", "firefox")
			cmd.Run()
		} else {
			// user may not choose anything, exit !
			return
		}
	}

	if foundSwitch {
		_, err = a.browser.Send(
			models.Command{
				Command: "switch-tab",
				Args:    id1,
			},
		)
		if err != nil {
			log.Println(err)
			os.Exit(1)
		}
		cmd := exec.Command("open", "-a", "firefox")
		cmd.Run()
	}
	if foundClose {
		_, err = a.browser.Send(
			models.Command{
				Command: "close-tabs",
				Args:    strings.Join(strings.Split(id2, " "), ","),
			},
		)
		if err != nil {
			log.Println(err)
			os.Exit(1)
		}
	}
}
