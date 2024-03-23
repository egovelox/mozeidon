package core

import (
	"encoding/json"
	"fmt"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) BookmarksGet(max int64, chunkSize int64) <-chan models.Bookmarks {
	channel := make(chan models.Bookmarks)

	go func() {
		defer close(channel)
		for result := range a.browser.Send(
			models.Command{
				Command: "get-bookmarks",
				Args:    fmt.Sprintf("%d:%d", max, chunkSize),
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
