package core

import (
	"github.com/egovelox/mozicli/browser/core/ports"
	"github.com/egovelox/mozicli/browser/infra"
)

type BrowserService struct {
	ports.CommandSender
}

func NewBrowserService() *BrowserService {
	return &BrowserService{infra.NewIpcClient("mozicli_host")}
}
