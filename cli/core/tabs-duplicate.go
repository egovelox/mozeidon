package core

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) TabsDuplicate(tabId int64, windowId int64) {
	channel := make(chan models.Tabs)

	go func() {
		defer close(channel)
		returnCode := 0
		for result := range a.browser.Send(
			models.Command{
				Command: "duplicate-tab",
				Args:    fmt.Sprintf("%d:%d", tabId, windowId),
			},
		) {
			// Check for error response
			if checkForError(result.Data) {
				returnCode = 1
				continue
			}

			tabs := models.Tabs{}
			json.Unmarshal(result.Data, &tabs)
			channel <- tabs
		}
		if returnCode != 0 {
			os.Exit(1)
		}
	}()

	for result := range channel {
		tabsAsString, _ := json.Marshal(result)
		fmt.Println(string(tabsAsString))
	}
}
