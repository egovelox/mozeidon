package core

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	goTemplates "text/template"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) BookmarksTemplate(template string, max int64, chunkSize int64) {

	for response := range a.browser.Send(
		models.Command{
			Command: "get-bookmarks",
			Args:    fmt.Sprintf("%d:%d", max, chunkSize),
		},
	) {

		bookmarks := models.Bookmarks{}
		// TODO: handle error
		json.Unmarshal(response.Data, &bookmarks)

		t, err := goTemplates.New("bookmarks-template").
			Parse(template)

		if err != nil {
			log.Fatal(err)
			os.Exit(1)
		}

		err = t.Execute(os.Stdout, bookmarks)

		if err != nil {
			log.Fatal(err)
			os.Exit(1)
		}

	}
}
