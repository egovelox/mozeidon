package core

import (
	"encoding/json"

	"github.com/egovelox/mozicli/browser/core/models"
)

func (a *App) BookmarksGet() (models.Bookmarks, error) {
	result, err := a.browser.Send(
		models.Command{
			Command: "get-bookmarks",
		},
	)
	if err != nil {
		return models.Bookmarks{}, err
	}
	bookmarks := models.Bookmarks{}
	// TODO: handle error
	json.Unmarshal(result.Data, &bookmarks)

	return bookmarks, nil
}
