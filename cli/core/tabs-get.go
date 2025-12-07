package core

import (
	"encoding/json"
	"os"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) TabsGet(recentlyClosed bool, latest10First bool) <-chan models.Tabs {

	channel := make(chan models.Tabs)

	var commandName string
	var args string
	if recentlyClosed {
		commandName = "get-recently-closed-tabs"
		args = ""
	} else {
		commandName = "get-tabs"
		if latest10First {
			args = "latest-10-first"
		} else {
			args = ""
		}
	}

	go func() {
		defer close(channel)
		returnCode := 0
		for result := range a.browser.Send(
			models.Command{
				Command: commandName,
				Args:    args,
			},
		) {
			// Check for error response
			if checkForError(result.Data) {
				returnCode = 1
				continue
			}

			tabs := models.Tabs{}
			json.Unmarshal(result.Data, &tabs)
			channel <- tabs
		}
		if returnCode != 0 {
			os.Exit(1)
		}
	}()

	return channel

}
