package core

import (
	"os"
	"os/exec"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) TabsSwitch(tabId string, shouldOpenBrowser bool) {
	returnCode := 0
	done := make(chan bool)

	go func() {
		for result := range a.browser.Send(
			models.Command{
				Command: "switch-tab",
				Args:    tabId,
			},
		) {
			if result.Data != nil {
				if checkForError(result.Data) {
					returnCode = 1
				}
			}
		}
		done <- true
	}()

	<-done
	if returnCode != 0 {
		os.Exit(1)
	}

	if shouldOpenBrowser {
		cmd := exec.Command("open", "-a", "firefox")
		cmd.Run()
	}
}
