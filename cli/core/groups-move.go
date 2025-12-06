package core

import (
	"fmt"
	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) GroupsMove(groupId int64, index int64) {
	<-a.browser.Send(
		models.Command{
			Command: "move-group",
			Args:    fmt.Sprintf("%d:%d", groupId, index),
		},
	)
}
