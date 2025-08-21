package core

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) HistoryDelete(url string, all bool) {
	returnCode := 0
	channel := make(chan models.CommandResult)

	args := ""
	if all {
		args = "all"
	} else {
		args = url
	}

	go func() {
		defer close(channel)

		command := models.Command{
			Command: "delete-history-items",
			Args:    args,
		}
		for result := range a.browser.Send(command) {
			channel <- result
		}
	}()

	for result := range channel {
		if result.Data != nil {
			data := models.DataResult{}
			json.Unmarshal(result.Data, &data)
			if strings.HasPrefix(string(data.Data), "[Error]") {
				fmt.Println(string(data.Data))
				returnCode = 1
			}
		}
	}
	if returnCode != 0 {
		os.Exit(1)
	}
}
