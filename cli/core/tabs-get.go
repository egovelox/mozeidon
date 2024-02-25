package core

import (
	"encoding/json"

	"github.com/egovelox/mozicli/browser/core/models"
)

func (a *App) TabsGet() (models.Tabs, error) {
	result, err := a.browser.Send(
		models.Command{
			Command: "match-tabs",
		},
	)
	if err != nil {
		return models.Tabs{}, err
	}
	tabs := models.Tabs{}
	// TODO: handle error
	json.Unmarshal(result.Data, &tabs)

	return tabs, nil
}
