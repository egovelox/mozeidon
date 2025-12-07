package core

import (
	"os"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) NewTab(query string) {
	var command models.Command

	if query != "" {
		command = models.Command{
			Command: "new-tab",
			Args:    query,
		}
	} else {
		command = models.Command{
			Command: "new-tab",
		}
	}

	returnCode := 0
	done := make(chan bool)

	go func() {
		for result := range a.browser.Send(command) {
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
}
