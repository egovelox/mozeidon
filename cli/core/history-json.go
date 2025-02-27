package core

import (
	"encoding/json"
	"fmt"
)

func (a *App) HistoryJson(max int64, chunkSize int64) {
	// TODO: handle error
	for result := range a.HistoryGet(max, chunkSize) {
		historyAsString, _ := json.Marshal(result)
		fmt.Println(string(historyAsString))
	}
}
