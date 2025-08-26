package core

import (
	"encoding/json"
	"fmt"
	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) TabsDuplicate(tabId int64, windowId int64) {
	channel := make(chan models.Tabs)

	go func() {
		defer close(channel)
		for result := range a.browser.Send(
			models.Command{
				Command: "duplicate-tab",
				Args:    fmt.Sprintf("%d:%d", tabId, windowId),
			},
		) {
			tabs := models.Tabs{}
			// TODO: handle error
			json.Unmarshal(result.Data, &tabs)
			channel <- tabs
		}
	}()

	for result := range channel {
		tabsAsString, _ := json.Marshal(result)
		fmt.Println(string(tabsAsString))
	}
}
