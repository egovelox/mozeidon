package core

import (
	"encoding/json"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) GroupsGet() <-chan models.Groups {

	channel := make(chan models.Groups)

	go func() {
		defer close(channel)
		for result := range a.browser.Send(
			models.Command{
				Command: "get-groups",
			},
		) {
			groups := models.Groups{}
			// TODO: handle error
			json.Unmarshal(result.Data, &groups)
			channel <- groups
		}
	}()

	return channel
}
