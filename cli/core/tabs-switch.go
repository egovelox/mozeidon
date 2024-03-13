package core

import (
	"os/exec"

	"github.com/egovelox/mozicli/browser/core/models"
)

func (a *App) TabsSwitch(tabId string, shouldOpenBrowser bool) {
	<-a.browser.Send(
		models.Command{
			Command: "switch-tab",
			Args:    tabId,
		},
	)

	if shouldOpenBrowser {
		cmd := exec.Command("open", "-a", "firefox")
		cmd.Run()
	}
}
