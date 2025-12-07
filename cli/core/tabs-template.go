package core

import (
	"encoding/json"
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
	
	returnCode := 0
	for response := range a.browser.Send(
		models.Command{
			Command: commandName,
			Args:    args,
		},
	) {
		// Check for error response
		if checkForError(response.Data) {
			returnCode = 1
			continue
		}

		tabs := models.Tabs{}
		if err := json.Unmarshal(response.Data, &tabs); err != nil {
			PrintError("Failed to parse tabs data: " + err.Error())
			returnCode = 1
			continue
		}

		t, err := goTemplates.New("tabs-template").Parse(template)
		if err != nil {
			PrintError("Invalid template: " + err.Error())
			os.Exit(1)
		}

		err = t.Execute(os.Stdout, tabs)
		if err != nil {
			PrintError("Template execution failed: " + err.Error())
			os.Exit(1)
		}
	}
	
	if returnCode != 0 {
		os.Exit(1)
	}
}
