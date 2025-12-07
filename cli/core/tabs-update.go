package core

import (
	"fmt"
	"os"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) TabsUpdate(tabId int64, windowId int64, tabIndex int64, groupId int64, userProvidedPin bool, pin bool, shouldBeUngrouped bool) {
	pinArg := "none"

	if userProvidedPin {
		pinArg = fmt.Sprintf("%t", pin)
	}

	returnCode := 0
	done := make(chan bool)

	go func() {
		for result := range a.browser.Send(
			models.Command{
				Command: "update-tab",
				Args:    fmt.Sprintf("%d:%d:%d:%d:%s:%t", tabId, windowId, tabIndex, groupId, pinArg, shouldBeUngrouped),
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
