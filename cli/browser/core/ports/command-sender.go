package ports

import "github.com/egovelox/mozeidon/browser/core/models"

type CommandSender interface {
	Send(models.Command) <-chan models.CommandResult
}
