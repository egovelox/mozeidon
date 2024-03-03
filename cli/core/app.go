package core

import (
	"github.com/spf13/viper"

	"github.com/egovelox/mozicli/browser/core"
	"github.com/egovelox/mozicli/ui"
)

type App struct {
	browser *core.BrowserService
	ui      *ui.Ui
	viper   *viper.Viper
}

func NewApp() (*App, error) {
	viper, err := InitConfig()

	if err != nil {
		return nil, err
	}

	browser := core.NewBrowserService()
	ui := ui.Ui{}

	return &App{browser: browser, ui: &ui, viper: viper}, nil
}
