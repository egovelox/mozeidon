package core

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) HistoryGet(
	max int64,
	chunkSize int64,
) <-chan models.HistoryItems {
	channel := make(chan models.HistoryItems)

	go func() {
		defer close(channel)
		returnCode := 0
		for result := range a.browser.Send(
			models.Command{
				Command: "get-history-items",
				Args:    fmt.Sprintf("%d:%d", max, chunkSize),
			},
		) {
			// Check for error response
			if checkForError(result.Data) {
				returnCode = 1
				continue
			}

			historyItems := models.HistoryItems{}
			json.Unmarshal(result.Data, &historyItems)
			channel <- historyItems
		}
		if returnCode != 0 {
			os.Exit(1)
		}
	}()

	return channel
}
