package core

import (
	"encoding/json"
	"os"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) GroupsGet() <-chan models.Groups {

	channel := make(chan models.Groups)

	go func() {
		defer close(channel)
		returnCode := 0
		for result := range a.browser.Send(
			models.Command{
				Command: "get-groups",
			},
		) {
			if checkForError(result.Data) {
				returnCode = 1
				continue
			}

			groups := models.Groups{}
			json.Unmarshal(result.Data, &groups)
			channel <- groups
		}
		if returnCode != 0 {
			os.Exit(1)
		}
	}()

	return channel
}
