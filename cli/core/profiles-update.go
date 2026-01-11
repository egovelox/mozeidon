package core

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) ProfilesUpdate(rank int, alias string, commandAlias string) <-chan models.StoredProfileData {

	channel := make(chan models.StoredProfileData)

	go func() {
		defer close(channel)
		returnCode := 0
		for result := range a.browser.Send(
			models.Command{
				Command: "update-profile",
				Args:    fmt.Sprintf("%d__mozeidon__%s__mozeidon__%s", rank, alias, commandAlias),
			},
		) {
			if checkForError(result.Data) {
				returnCode = 1
				continue
			}
			profile := models.StoredProfileData{}
			json.Unmarshal(result.Data, &profile)
			channel <- profile
		}
		if returnCode != 0 {
			os.Exit(1)
		}
	}()

	return channel

}
