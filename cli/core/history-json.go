package core

import (
	"encoding/json"
	"fmt"
)

func (a *App) HistoryJson(max int64, chunkSize int64) {
	// note: the program may have exited if HistoryGet encountered an error
	for result := range a.HistoryGet(max, chunkSize) {
		historyAsString, _ := json.Marshal(result)
		fmt.Println(string(historyAsString))
	}
}
