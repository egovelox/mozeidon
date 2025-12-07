package core

import (
	"encoding/json"
	"fmt"
	"os"
	goTemplates "text/template"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) BookmarksTemplate(template string, max int64, chunkSize int64) {

	returnCode := 0
	for response := range a.browser.Send(
		models.Command{
			Command: "get-bookmarks",
			Args:    fmt.Sprintf("%d:%d", max, chunkSize),
		},
	) {
		// Check for error response
		if checkForError(response.Data) {
			returnCode = 1
			continue
		}

		bookmarks := models.Bookmarks{}
		if err := json.Unmarshal(response.Data, &bookmarks); err != nil {
			PrintError("Failed to parse bookmarks data: " + err.Error())
			returnCode = 1
			continue
		}

		t, err := goTemplates.New("bookmarks-template").Parse(template)
		if err != nil {
			PrintError("Invalid template: " + err.Error())
			os.Exit(1)
		}

		err = t.Execute(os.Stdout, bookmarks)
		if err != nil {
			PrintError("Template execution failed: " + err.Error())
			os.Exit(1)
		}
	}
	
	if returnCode != 0 {
		os.Exit(1)
	}
}
