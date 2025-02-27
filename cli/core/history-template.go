package core

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	goTemplates "text/template"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) HistoryTemplate(template string, max int64, chunkSize int64) {

	for response := range a.browser.Send(
		models.Command{
			Command: "get-history-items",
			Args:    fmt.Sprintf("%d:%d", max, chunkSize),
		},
	) {

		historyItems := models.HistoryItems{}
		// TODO: handle error
		json.Unmarshal(response.Data, &historyItems)

		t, err := goTemplates.New("history-template").
			Parse(template)

		if err != nil {
			log.Fatal(err)
			os.Exit(1)
		}

		err = t.Execute(os.Stdout, historyItems)

		if err != nil {
			log.Fatal(err)
			os.Exit(1)
		}

	}
}
