package core

import (
	"encoding/json"
	"fmt"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) HistoryGet(
	max int64,
	chunkSize int64,
) <-chan models.HistoryItems {
	channel := make(chan models.HistoryItems)

	go func() {
		defer close(channel)
		for result := range a.browser.Send(
			models.Command{
				Command: "get-history-items",
				Args:    fmt.Sprintf("%d:%d", max, chunkSize),
			},
		) {
			historyItems := models.HistoryItems{}
			// TODO: handle error
			json.Unmarshal(result.Data, &historyItems)
			channel <- historyItems
		}

	}()

	return channel
}
