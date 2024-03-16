package core

import (
	"strings"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) TabsClose(tabIds []string) {
	<-a.browser.Send(
		models.Command{
			Command: "close-tabs",
			Args:    strings.Join(tabIds, ","),
		},
	)
}
