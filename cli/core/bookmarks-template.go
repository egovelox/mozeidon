package core

import (
	"encoding/json"
	"log"
	"os"
	goTemplates "text/template"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) BookmarksTemplate(template string) {

	for response := range a.browser.Send(
		models.Command{
			Command: "get-bookmarks",
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
