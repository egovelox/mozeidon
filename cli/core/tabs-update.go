package core

import (
	"fmt"
	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) TabsUpdate(tabId int64, windowId int64, tabIndex int64, userProvidedPin bool, pin bool) {
	pinArg := "none"

	if userProvidedPin {
		pinArg = fmt.Sprintf("%t", pin)
	}

	<-a.browser.Send(
		models.Command{
			Command: "update-tab",
			Args:    fmt.Sprintf("%d:%d:%d:%s", tabId, windowId, tabIndex, pinArg),
		},
	)
}
