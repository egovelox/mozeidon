package core

import (
	"fmt"
	"os"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) GroupsMove(groupId int64, index int64) {
	returnCode := 0
	done := make(chan bool)

	go func() {
		for result := range a.browser.Send(
			models.Command{
				Command: "move-group",
				Args:    fmt.Sprintf("%d:%d", groupId, index),
			},
		) {
			if result.Data != nil {
				if checkForError(result.Data) {
					returnCode = 1
				}
			}
		}
		done <- true
	}()

	<-done
	if returnCode != 0 {
		os.Exit(1)
	}
}
