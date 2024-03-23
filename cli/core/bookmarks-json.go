package core

import (
	"encoding/json"
	"fmt"
)

func (a *App) BookmarksJson(max int64, chunkSize int64) {
	// TODO: handle error
	for result := range a.BookmarksGet(max, chunkSize) {
		bookmarksAsString, _ := json.Marshal(result)
		fmt.Println(string(bookmarksAsString))
	}
}
