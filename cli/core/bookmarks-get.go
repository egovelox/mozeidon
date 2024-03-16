package core

import (
	"encoding/json"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) BookmarksGet() <-chan models.Bookmarks {
	channel := make(chan models.Bookmarks)

	go func() {
		defer close(channel)
		for result := range a.browser.Send(
			models.Command{
				Command: "get-bookmarks",
			},
		) {
			bookmarks := models.Bookmarks{}
			// TODO: handle error
			json.Unmarshal(result.Data, &bookmarks)
			channel <- bookmarks
		}

	}()

	return channel
}
