package ports

import "github.com/egovelox/mozicli/browser/core/models"

type CommandSender interface {
	Send(models.Command) (models.CommandResult, error)
}
