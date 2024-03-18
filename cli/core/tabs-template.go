package core

import (
	"encoding/json"
	"log"
	"os"
	goTemplates "text/template"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) TabsTemplate(template string) {

	for response := range a.browser.Send(
		models.Command{
			Command: "get-tabs",
		},
	) {

		tabs := models.Tabs{}
		// TODO: handle error
		json.Unmarshal(response.Data, &tabs)

		t, err := goTemplates.New("tabs-template").
			Parse(template)

		if err != nil {
			log.Fatal(err)
			os.Exit(1)
		}

		err = t.Execute(os.Stdout, tabs)

		if err != nil {
			log.Fatal(err)
			os.Exit(1)
		}

	}
}
