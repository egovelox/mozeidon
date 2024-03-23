package core

import (
	"github.com/egovelox/mozeidon/browser/core"
)

type App struct {
	browser *core.BrowserService
}

func NewApp() (*App, error) {
	browser := core.NewBrowserService()

	return &App{browser: browser}, nil
}
