package core

import (
	"encoding/json"
	"os"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) WindowsGet() <-chan models.Windows {

	channel := make(chan models.Windows)

	go func() {
		defer close(channel)
		returnCode := 0
		for result := range a.browser.Send(
			models.Command{
				Command: "get-windows",
			},
		) {
			if checkForError(result.Data) {
				returnCode = 1
				continue
			}

			windows := models.Windows{}
			json.Unmarshal(result.Data, &windows)
			channel <- windows
		}
		if returnCode != 0 {
			os.Exit(1)
		}
	}()

	return channel
}
