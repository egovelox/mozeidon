package core

import (
	"github.com/egovelox/mozeidon/browser/core/ports"
	"github.com/egovelox/mozeidon/browser/infra"
)

type BrowserService struct {
	ports.CommandSender
}

func NewBrowserService() *BrowserService {
	return &BrowserService{infra.NewIpcClient("mozeidon_native_app")}
}
