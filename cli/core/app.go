package core

import (
	"github.com/egovelox/mozicli/browser/core"
	"github.com/egovelox/mozicli/ui"
)

type App struct {
	browser *core.BrowserService
	ui      *ui.Ui
}

func NewApp() *App {
	browser := core.NewBrowserService()
	ui := ui.Ui{}

	return &App{browser: browser, ui: &ui}
}
