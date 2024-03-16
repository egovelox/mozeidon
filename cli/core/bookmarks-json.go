package core

import (
	"encoding/json"
	"fmt"
)

func (a *App) BookmarksJson(query string) {
	// TODO: handle error
	for result := range a.BookmarksGet() {
		bookmarksAsString, _ := json.Marshal(result)
		fmt.Println(string(bookmarksAsString))
	}
}
