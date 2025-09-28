package core

import (
	"fmt"
	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) GroupsUpdate(groupId int64, groupTitle string, groupColor string, userProvidedCollapsed bool, collapsed bool) {
	collapseArg := "none"

	if userProvidedCollapsed {
		collapseArg = fmt.Sprintf("%t", collapsed)
	}

	<-a.browser.Send(
		models.Command{
			Command: "update-group",
			Args:    fmt.Sprintf("%d:%s:%s:%s", groupId, groupTitle, groupColor, collapseArg),
		},
	)
}
