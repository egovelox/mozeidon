package core

import (
	"encoding/json"
	"os"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) BookmarkWrite(query *models.BookmarkWriteQuery) {
	returnCode := 0
	channel := make(chan models.CommandResult)

	go func() {
		defer close(channel)
		b, _ := json.Marshal(query)
		command := models.Command{
			Command: "write-bookmark",
			Args:    string(b),
		}
		for result := range a.browser.Send(command) {
			channel <- result
		}
	}()

	for result := range channel {
		if result.Data != nil {
			if checkForError(result.Data) {
				returnCode = 1
			}
		}
	}
	if returnCode != 0 {
		os.Exit(1)
	}
}
