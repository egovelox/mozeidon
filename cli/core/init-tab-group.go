package core

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) InitTabGroup(tabId int64, windowId int64, groupTitle string, groupColor string) {
	returnCode := 0
	channel := make(chan models.CommandResult)

	go func() {
		defer close(channel)
		command := models.Command{
			Command: "new-group-tab",
			Args:    fmt.Sprintf("%d:%d:%s:%s", tabId, windowId, groupTitle, groupColor),
		}
		for result := range a.browser.Send(command) {
			channel <- result
		}
	}()

	for result := range channel {
		if result.Data != nil {
			if checkForError(result.Data) {
				returnCode = 1
				continue
			}
			data := models.DataResult{}
			json.Unmarshal(result.Data, &data)
			fmt.Println(string(data.Data))
		}
	}
	if returnCode != 0 {
		os.Exit(1)
	}
}
