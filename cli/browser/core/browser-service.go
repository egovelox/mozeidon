package core

import (
	"github.com/egovelox/mozeidon/browser/core/ports"
	"github.com/egovelox/mozeidon/browser/infra"
)

type BrowserService struct {
	ports.CommandSender
}

func NewBrowserService(ipcName string) *BrowserService {
	return &BrowserService{infra.NewIpcClient(ipcName)}
}
