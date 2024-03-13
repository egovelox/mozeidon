package core

import (
	"encoding/json"

	"github.com/egovelox/mozicli/browser/core/models"
)

func (a *App) TabsGet(recentlyClosed bool) <-chan models.Tabs {

	channel := make(chan models.Tabs)

	var commandName string
	if recentlyClosed {
		commandName = "get-recently-closed-tabs"
	} else {
		commandName = "get-tabs"
	}

	go func() {
		defer close(channel)
		for result := range a.browser.Send(
			models.Command{
				Command: commandName,
			},
		) {
			tabs := models.Tabs{}
			// TODO: handle error
			json.Unmarshal(result.Data, &tabs)
			channel <- tabs
		}
	}()

	return channel

}
