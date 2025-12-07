package core

import (
	"fmt"
	"os"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) GroupsUpdate(groupId int64, groupTitle string, groupColor string, userProvidedCollapsed bool, collapsed bool) {
	collapseArg := "none"

	if userProvidedCollapsed {
		collapseArg = fmt.Sprintf("%t", collapsed)
	}

	returnCode := 0
	done := make(chan bool)

	go func() {
		for result := range a.browser.Send(
			models.Command{
				Command: "update-group",
				Args:    fmt.Sprintf("%d:%s:%s:%s", groupId, groupTitle, groupColor, collapseArg),
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
