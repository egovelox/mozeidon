package core

import (
	"encoding/json"
	"log"
	"os"
	goTemplates "text/template"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) TabsTemplate(template string, recentlyClosed bool, latest10First bool) {

	var commandName string
	var args string
	if recentlyClosed {
		commandName = "get-recently-closed-tabs"
		args = ""
	} else {
		commandName = "get-tabs"
		if latest10First {
			args = "latest-10-first"
		} else {
			args = ""
		}
	}
	for response := range a.browser.Send(
		models.Command{
			Command: commandName,
			Args:    args,
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
